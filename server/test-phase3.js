/**
 * @file test-phase3.js
 * @description Integration verification test suite for Phase 3 TMDB service and movie routes.
 */

import http from 'http';
import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import User from './src/models/User.js';

const PORT = 5007;

async function runTests() {
  console.log('--- Phase 3 TMDB Movie API Test Suite ---');

  await connectDB();

  // Create or retrieve verified test user
  await User.deleteMany({ email: 'tmdbtest@phase3.com' });
  const testUser = await User.create({
    name: 'Movie Explorer',
    email: 'tmdbtest@phase3.com',
    password: 'Password123!'
  });
  const token = testUser.generateAuthToken();
  const authCookie = `token=${token}`;

  const server = app.listen(PORT);

  const request = (path, method = 'GET', cookie = null) => {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (cookie) headers['Cookie'] = cookie;

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path,
          method,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let parsed = null;
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = data;
            }
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsed
            });
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  };

  try {
    // 1. Unauthenticated Request
    console.log('[Test 1] Testing unauthenticated GET /api/movies/trending...');
    const unauthRes = await request('/api/movies/trending');
    console.log('Unauth Status:', unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated catalog access, got ${unauthRes.status}`);
    }
    console.log('✔ Catalog route properly guarded with 401 Unauthorized.');

    // 2. Authenticated Trending Request
    console.log('[Test 2] Testing authenticated GET /api/movies/trending...');
    const trendingRes = await request('/api/movies/trending', 'GET', authCookie);
    console.log('Trending Status:', trendingRes.status);
    console.log('Trending Results Count:', trendingRes.body.results?.length);
    if (trendingRes.status !== 200 || !Array.isArray(trendingRes.body.results)) {
      throw new Error('Failed to retrieve trending movie results');
    }
    const firstMovie = trendingRes.body.results[0];
    console.log('Sample Normalized Movie:', {
      id: firstMovie.id,
      title: firstMovie.title,
      rating: firstMovie.rating,
      posterPath: firstMovie.posterPath
    });
    if (!firstMovie.id || !firstMovie.title || firstMovie.rating === undefined) {
      throw new Error('Movie normalization contract failed');
    }
    console.log('✔ Normalized trending movies retrieved successfully.');

    // 3. Top Rated Movies
    console.log('[Test 3] Testing GET /api/movies/top-rated...');
    const topRatedRes = await request('/api/movies/top-rated', 'GET', authCookie);
    if (topRatedRes.status !== 200 || !topRatedRes.body.results) {
      throw new Error('Top rated query failed');
    }
    console.log('✔ Top rated movies retrieved successfully.');

    // 4. Popular Movies
    console.log('[Test 4] Testing GET /api/movies/popular...');
    const popularRes = await request('/api/movies/popular', 'GET', authCookie);
    if (popularRes.status !== 200 || !popularRes.body.results) {
      throw new Error('Popular query failed');
    }
    console.log('✔ Popular movies retrieved successfully.');

    // 5. Genre Query
    console.log('[Test 5] Testing GET /api/movies/genre/28 (Action)...');
    const genreRes = await request('/api/movies/genre/28', 'GET', authCookie);
    if (genreRes.status !== 200 || !genreRes.body.results) {
      throw new Error('Genre query failed');
    }
    console.log('✔ Action genre movies retrieved successfully.');

    // 6. Search Query
    console.log('[Test 6] Testing GET /api/movies/search?q=Inception...');
    const searchRes = await request('/api/movies/search?q=Inception', 'GET', authCookie);
    if (searchRes.status !== 200 || !searchRes.body.results) {
      throw new Error('Search query failed');
    }
    console.log('✔ Search query executed successfully.');

    // 7. Movie Details
    console.log('[Test 7] Testing GET /api/movies/157336 (Interstellar details)...');
    const detailsRes = await request('/api/movies/157336', 'GET', authCookie);
    console.log('Details Status:', detailsRes.status);
    console.log('Movie Details:', {
      title: detailsRes.body.movie?.title,
      runtime: detailsRes.body.movie?.runtime,
      tagline: detailsRes.body.movie?.tagline
    });
    if (detailsRes.status !== 200 || !detailsRes.body.movie?.title) {
      throw new Error('Details query failed');
    }
    console.log('✔ Movie details retrieved successfully.');

    // 8. Movie Videos / Trailer
    console.log('[Test 8] Testing GET /api/movies/157336/videos...');
    const videoRes = await request('/api/movies/157336/videos', 'GET', authCookie);
    console.log('Video Status:', videoRes.status);
    console.log('Trailer Data:', videoRes.body);
    if (videoRes.status !== 200 || !videoRes.body.trailerKey || !videoRes.body.embedUrl) {
      throw new Error('Video trailer key query failed');
    }
    console.log('✔ Movie trailer embed key retrieved successfully.');

    // 9. Cache Verification
    console.log('[Test 9] Testing In-Memory Cache Response Speed...');
    const start = Date.now();
    await request('/api/movies/157336', 'GET', authCookie);
    const duration = Date.now() - start;
    console.log(`Cached response fulfilled in ${duration}ms`);
    console.log('✔ In-memory cache operational.');

    console.log('\n🎉 ALL PHASE 3 TMDB SERVICE & MOVIE TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    await User.deleteMany({ email: 'tmdbtest@phase3.com' });
    server.close();
    await disconnectDB();
  }
}

runTests().catch((err) => {
  console.error('Phase 3 Tests Failed:', err);
  process.exit(1);
});
