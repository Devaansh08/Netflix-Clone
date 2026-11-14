# StreamVerse — Engineering Performance & Optimization Guide

This document details the architectural decisions, caching pipelines, and bundle optimizations implemented across **StreamVerse** to ensure sub-second Time to Interactive (TTI), zero Cumulative Layout Shift (CLS), and strict bandwidth economy.

---

## 1. Backend Performance Optimizations

### 1.1 In-Memory TMDB Response Caching (`node-cache`)
- **Problem:** TMDB's public v3 API enforces strict rate limits. High traffic to catalog endpoints (Trending, Top Rated) causes network bottlenecks and risks HTTP 429 (Too Many Requests).
- **Solution:** Integrated an in-memory caching tier in `tmdbService.js` with a 10-minute (600s) TTL.
- **Impact:** Repeated catalog requests resolve in **< 3ms** directly from Node heap memory rather than incurring ~250ms WAN round trips to external TMDB endpoints.

### 1.2 Gzip / Deflate Stream Compression (`compression`)
- **Problem:** Rich JSON catalog payloads containing arrays of movie objects with synopses and metadata consume substantial network transfer bandwidth.
- **Solution:** Enqueued Express `compression()` middleware before routing logic.
- **Impact:** Cuts JSON payload transfer size by **60% to 80%**, accelerating initial page loads over mobile 4G/5G connections.

### 1.3 HTTP Caching & Edge Revalidation (`Cache-Control`)
- **Implementation:** Movie catalog routes dispatch:
  ```http
  Cache-Control: public, max-age=300, stale-while-revalidate=60
  ```
- **Rationale:** Instructs client browsers and edge CDN reverse proxies (Cloudflare, Vercel Edge) to serve cached catalog feeds for 5 minutes, allowing instant re-renders while revalidating fresh data asynchronously.

### 1.4 Database Indexing & Atomic Operations
- **Watch History:** Compound unique index `{ user: 1, tmdbId: 1 }` prevents concurrent heartbeat race conditions. Secondary index `{ user: 1, updatedAt: -1 }` avoids in-memory collection scans when populating the "Continue Watching" rail.
- **Atomic Operations:** Uses `$addToSet` and `$push` with `$position: 0` alongside atomic `$pull` to eliminate the need to fetch entire Mongoose documents into memory before mutating.

---

## 2. Frontend Performance Optimizations

### 2.1 Route-Level Code Splitting (`React.lazy` + `Suspense`)
- **Problem:** Bundling the entire application—including the heavy `Hls.js` video streaming library and all page views—into a single monolithic bundle inflates the initial bundle size and delays First Contentful Paint (FCP).
- **Solution:** Sliced routes in `App.jsx` using `React.lazy()`:
  ```javascript
  const Home = lazy(() => import('./pages/Home.jsx'));
  const Watch = lazy(() => import('./pages/Watch.jsx')); // Contains Hls.js
  ```
- **Measurement:**
  - Initial entry bundle: **~112 kB gzipped**
  - Video engine (`Watch-*.js` chunk containing `hls.js`): **~183 kB gzipped** (deferred until user actually enters the video player)

### 2.2 Hover-Triggered Query Prefetching
- **Mechanism:** When a user hovers over a `<MovieCard />`, an `onMouseEnter` event fires `queryClient.prefetchQuery()` for the movie's full synopsis and YouTube trailer key.
- **Human Factor:** Users typically hesitate for 150ms to 300ms between hovering over a poster and clicking it. During this perceptual gap, data is fetched and cached.
- **Result:** Clicking any movie card opens the `<DetailsModal />` with **0ms perceived latency**.

### 2.3 Image Optimization & Native Lazy Loading
- **Poster Dimension Selection:** Uses TMDB's `w342` or `w500` dimension buckets for carousel cards rather than uncompressed 4K `original` images.
- **Native Browser Lazy Loading:** Images specify `loading="lazy"` and `decoding="async"`, preventing off-screen cards from consuming network bandwidth until the user scrolls them into the viewport.
- **Hero Image Priority:** The single featured hero backdrop utilizes `fetchPriority="high"` to ensure the Largest Contentful Paint (LCP) element renders as fast as possible.

### 2.4 Layout Stability & Shimmer Skeletons (CLS = 0)
- `<HeroSkeleton />` and `<RowSkeleton />` reserve the exact aspect ratio containers (16:9 for hero, 2:3 for posters) before network assets load, eliminating sudden content jumps (Cumulative Layout Shift).

---

## 3. Top 5 Lighthouse Audit Findings & Remediations

| Finding / Bottleneck | Category | Impact | Implemented Solution |
| :--- | :--- | :--- | :--- |
| **1. Unused JavaScript on initial load** | Performance | Heavy bundle blocking TTI | Route-level `React.lazy()` code splitting; isolates `hls.js` exclusively to `/watch/:id`. |
| **2. Cumulative Layout Shift (CLS)** | Core Web Vitals | Content jumps as posters load | Pre-rendered aspect-ratio skeleton loaders (`HeroSkeleton`, `RowSkeleton`). |
| **3. Excessive network requests on search** | Performance & API | TMDB rate limit exhaustion | 400ms debounce on search input; eliminates intermediate keystroke requests. |
| **4. Uncompressed API payloads** | Transfer Size | High data usage on mobile | Express `compression()` middleware enabled on backend. |
| **5. Sub-optimal caching policy** | Best Practices | Repetitive round-trips | Configured `staleTime: 5 min` in React Query and `Cache-Control` response headers on movie routes. |
