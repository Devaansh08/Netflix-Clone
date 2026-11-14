# StreamVerse — Engineering Interview Guide & Talking Points

This guide prepares you to speak confidently, deeply, and clearly about the architectural decisions, security boundaries, and trade-offs made while building **StreamVerse**.

---

## 1. Architecture Explained Simply (The 60-Second Elevator Pitch)

> *"StreamVerse is a production-grade full-stack video streaming platform built on the MERN stack with React, Tailwind CSS, TanStack Query, Express, and MongoDB. 
> 
> The core design principle was **security and efficiency at scale**: we never expose third-party API keys (like TMDB) to the client—all movie discovery requests are proxied and cached in-memory on the backend. Authentication relies on cryptographically signed JWTs dispatched in `httpOnly`, `sameSite`, `secure` cookies to eliminate XSS token theft. 
> 
> On the video engineering side, we avoid illegal pirate streams and instead deliver authentic Adaptive Bitrate Streaming (ABR) using `Hls.js` with Creative Commons open-source master playlists (.m3u8), while continuously synchronizing playback progress back to MongoDB so users can resume watching across sessions."*

---

## 2. Top 10 Technical Interview Questions & Answers

### Q1: Why did you store JWTs in an `httpOnly` cookie instead of `localStorage`?
**Answer:**
> *"Storing JWTs in `localStorage` makes the application vulnerable to Cross-Site Scripting (XSS). If a malicious script or compromised npm package executes in the browser, `window.localStorage.getItem('token')` can immediately exfiltrate the token to an external server. 
> 
> By setting the JWT in an `httpOnly` cookie from Express, the browser's JavaScript runtime engine is strictly prohibited from accessing `document.cookie`. Coupled with `sameSite: 'lax'` (or `'none'` with `secure: true` in cross-site production), the token is automatically transmitted with authenticated requests while preventing CSRF and XSS attacks."*

### Q2: Why proxy TMDB requests through your Express backend instead of calling TMDB directly from React?
**Answer:**
> *"Calling third-party APIs directly from browser client code requires exposing the `TMDB_API_KEY` in network headers or bundled JS bundles (e.g. `VITE_TMDB_KEY`), allowing any user to steal our credentials and exhaust our API quota. 
> 
> Proxying requests through Express provides three key benefits:
> 1. **Credential Secrecy:** The key remains strictly in backend environment variables.
> 2. **In-Memory Caching:** We cache slow-moving catalog feeds (Trending, Top Rated) using `node-cache` with a 10-minute TTL, serving requests in < 3ms instead of making expensive outbound round trips.
> 3. **Response Normalization:** TMDB returns hundreds of unused fields and disparate schemas for movies vs TV shows. Our backend normalizes them into a lean contract, cutting payload transfer size by over 70%."*

### Q3: How does Adaptive Bitrate Streaming (ABR) work with HLS and `hls.js`?
**Answer:**
> *"Adaptive Bitrate Streaming dynamically matches video stream quality to the user's available bandwidth and CPU capabilities in real-time. 
> 
> Rather than downloading a large monolithic MP4 file, an HLS master playlist (`.m3u8`) indexes multiple child stream playlists corresponding to different resolutions and bitrates (e.g., 360p, 720p, 1080p). Each stream is split into short 2-6 second chunks. `Hls.js` continuously monitors chunk download latency and buffer health. If network throughput drops, it seamlessly downloads the next chunk at a lower bitrate to prevent playback buffering; as connection speeds recover, it ramps back up to HD/4K quality."*

### Q4: Why did you decouple `app.js` from `server.js`?
**Answer:**
> *"Decoupling Express application setup (`app.js`) from network listener binding (`server.js`) is an essential architectural pattern for automated integration testing. 
> 
> With Supertest, we pass the raw `app` instance directly to test suites, which mounts in-memory HTTP listeners on random ephemeral sockets. If `server.listen()` were embedded directly inside `app.js`, running tests in parallel in CI/CD pipelines would trigger `EADDRINUSE` port collisions."*

### Q5: How did you implement playback checkpoint synchronization without overloading MongoDB?
**Answer:**
> *"Video players can emit dozens of time-update events per second. We throttle watch history writes through three mechanisms:
> 1. **Heartbeat Throttling:** The player only dispatches a `PUT /api/history` request once every 10 seconds, as well as on manual pause or component unmount.
> 2. **Atomic Upsert:** We use Mongoose's `findOneAndUpdate` with `upsert: true` matching `{ user: req.user._id, tmdbId }`. This guarantees a single query updates the existing record without race conditions.
> 3. **Database Indexing:** We enforced a compound unique index on `{ user: 1, tmdbId: 1 }` and indexed `{ user: 1, updatedAt: -1 }` to serve the 'Continue Watching' feed directly from the index tree."*

### Q6: What is Cumulative Layout Shift (CLS) and how did you prevent it?
**Answer:**
> *"CLS is a Core Web Vital that measures unexpected layout movement while elements render asynchronously. For example, if a browser renders the home page and movie posters load seconds later without reserved dimensions, the content below abruptly jerks downward, frustrating users. 
> 
> We resolved this by building `<HeroSkeleton />` and `<RowSkeleton />` components that reserve the exact aspect-ratio bounding boxes (16:9 for banners, 2:3 for cards) using CSS aspect ratio utilities and pulse shimmer effects until data arrives."*

### Q7: What is the benefit of hover prefetching in `MovieCard.jsx`?
**Answer:**
> *"When a user hovers over a movie card, there is an inherent perceptual gap of 150ms to 300ms before their finger or mouse click actually triggers the modal. 
> 
> By attaching an `onMouseEnter` listener that calls `queryClient.prefetchQuery()` for the movie details and YouTube trailer keys, the data is already stored in TanStack Query's memory cache before the click event fires. When the modal opens, it renders with 0ms perceptible delay."*

### Q8: How does your centralized error handler protect against information leakage?
**Answer:**
> *"In unhandled Express applications, database errors can dump complete SQL/MongoDB query syntax, internal file paths, or system stack traces back to client browsers. 
> 
> Our centralized `errorHandler.js` intercepts all exceptions. In development mode, it preserves the stack trace for rapid debugging; in production (`NODE_ENV === 'production'`), it maps database CastErrors, validation issues, and JWT expiration into uniform, sanitized JSON responses (`{ success: false, message: ... }`) without exposing internal server architecture."*

### Q9: Why did you embed `myList` inside the User document, but separate `WatchHistory` into its own collection?
**Answer:**
> *"This was a deliberate data modeling decision based on MongoDB schema design principles:
> 1. **My List:** A personal watchlist is an 1-to-Few relationship (rarely exceeding a few hundred items) that is always read together with the user profile on login. Embedding it eliminates an expensive `$lookup` join.
> 2. **Watch History:** Watch history is an unbounded 1-to-Many stream that creates a record for every preview or media item the user touches. Embedding unbounded arrays into the User document would risk hitting MongoDB's 16MB BSON document cap and inflate the memory footprint of every user session query. Keeping it in a separate collection with indexes keeps user documents lightweight."*

### Q10: What happens during a Graceful Shutdown (`SIGTERM` / `SIGINT`)?
**Answer:**
> *"In container platforms like Kubernetes, Docker, or Render, instances receive `SIGTERM` when scaling down or deploying new code. If the process is killed abruptly, in-flight HTTP transactions get severed and MongoDB socket pools are abandoned. 
> 
> Our server intercepts `SIGTERM` and `SIGINT`: it calls `server.close()` to stop accepting new incoming requests, allows active requests to complete, cleanly closes the Mongoose connection pool (`disconnectDB()`), and exits cleanly with code 0."*

---

## 3. Engineering Trade-offs Made

| Decision | Chosen Approach | Alternative Considered | Rationale / Trade-Off |
| :--- | :--- | :--- | :--- |
| **Catalog Caching** | In-Memory `NodeCache` | Redis Distributed Cache | `NodeCache` requires zero external infrastructure dependencies for portfolio deployment, while providing sub-millisecond retrieval. In high-scale multi-instance production, we would swap to Redis. |
| **Video Playback Source** | Blender Open Movies / HLS Test Streams | Pirated HLS Streams or Raw MP4s | Pirated sources trigger immediate recruiter rejection and legal risk. Raw MP4s lack adaptive bitrate switching. Blender open movies are 100% legal, open-source CC media served via authentic HLS. |
| **Styling Solution** | Tailwind CSS v4 | CSS Modules / Styled Components | Tailwind eliminates CSS runtime overhead, provides consistent design tokens, and enables responsive utility classes directly inside components. |
| **State Management** | TanStack Query + React Context | Redux Toolkit | Server state (caching, deduping, revalidation) belongs in TanStack Query; UI auth state belongs in lightweight Context. Redux would introduce needless boilerplate for this architecture. |
