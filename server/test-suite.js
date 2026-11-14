/**
 * @file test-suite.js
 * @description Comprehensive automated integration test suite using Supertest against in-memory app instance.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Testing Decoupled App without Port Allocation:
 *    Because `app.js` is exported independently of `server.js` (which binds the network socket),
 *    Supertest can bind ephemeral, zero-collision in-memory sockets. Multiple test runners can execute
 *    in parallel in CI without `EADDRINUSE` port collision failures.
 * 2. Automated Regression Protection:
 *    Validates HTTP status codes, JSON contracts, httpOnly cookies, and database operations end-to-end.
 */

import request from 'supertest';
import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import User from './src/models/User.js';
import WatchHistory from './src/models/WatchHistory.js';

async function runSupertestSuite() {
  console.log('====================================================');
  console.log('🚀 Running StreamVerse Comprehensive Supertest Suite');
  console.log('====================================================');

  await connectDB();

  // Test credentials
  const testUser = {
    name: 'Supertest User',
    email: 'supertest@streamverse.com',
    password: 'SecurePassword123!'
  };

  // Clean test records
  await User.deleteMany({ email: testUser.email });
  await WatchHistory.deleteMany({});

  let authCookie = null;

  try {
    // --------------------------------------------------------------------------
    // 1. HEALTH CHECK TEST
    // --------------------------------------------------------------------------
    console.log('[Suite 1] GET /api/health');
    const healthRes = await request(app).get('/api/health');
    if (healthRes.status !== 200 || !healthRes.body.success) {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
    }
    console.log('✔ Health check returned 200 OK with connected DB state.');

    // --------------------------------------------------------------------------
    // 2. AUTHENTICATION (SIGNUP & LOGIN)
    // --------------------------------------------------------------------------
    console.log('[Suite 2] POST /api/auth/signup');
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    if (signupRes.status !== 201 || !signupRes.body.success) {
      throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
    }
    const setCookie = signupRes.headers['set-cookie'];
    if (!setCookie || !setCookie.some(c => c.includes('token='))) {
      throw new Error('httpOnly token cookie was not attached to signup response');
    }
    authCookie = setCookie.find(c => c.startsWith('token=')).split(';')[0];
    console.log('✔ Signup registered user and set httpOnly cookie.');

    console.log('[Suite 3] POST /api/auth/login');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    if (loginRes.status !== 200 || !loginRes.body.user) {
      throw new Error('Login failed with valid credentials');
    }
    console.log('✔ Login verified credentials and refreshed session.');

    console.log('[Suite 4] GET /api/auth/me');
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie);

    if (meRes.status !== 200 || meRes.body.user.email !== testUser.email) {
      throw new Error('Failed to retrieve user profile via cookie');
    }
    console.log('✔ GET /api/auth/me authenticated successfully.');

    // --------------------------------------------------------------------------
    // 3. MOVIE CATALOG (TMDB PROXY)
    // --------------------------------------------------------------------------
    console.log('[Suite 5] GET /api/movies/trending');
    const trendingRes = await request(app)
      .get('/api/movies/trending')
      .set('Cookie', authCookie);

    if (trendingRes.status !== 200 || !Array.isArray(trendingRes.body.results)) {
      throw new Error('Failed to fetch trending movies');
    }
    console.log(`✔ Trending feed returned ${trendingRes.body.results.length} normalized items.`);

    console.log('[Suite 6] GET /api/movies/157336 (Interstellar)');
    const detailsRes = await request(app)
      .get('/api/movies/157336')
      .set('Cookie', authCookie);

    if (detailsRes.status !== 200 || detailsRes.body.movie.title !== 'Interstellar') {
      throw new Error('Failed to fetch movie details');
    }
    console.log('✔ Movie details endpoint verified.');

    console.log('[Suite 7] GET /api/movies/157336/videos');
    const videosRes = await request(app)
      .get('/api/movies/157336/videos')
      .set('Cookie', authCookie);

    if (videosRes.status !== 200 || !videosRes.body.trailerKey) {
      throw new Error('Failed to fetch trailer key');
    }
    console.log('✔ Trailer key retrieved successfully.');

    // --------------------------------------------------------------------------
    // 4. MY LIST WATCHLIST
    // --------------------------------------------------------------------------
    console.log('[Suite 8] POST /api/list (Add movie)');
    const addListRes = await request(app)
      .post('/api/list')
      .set('Cookie', authCookie)
      .send({
        tmdbId: 157336,
        title: 'Interstellar',
        posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
      });

    if (addListRes.status !== 200 || addListRes.body.myList.length !== 1) {
      throw new Error('Add to list failed');
    }
    console.log('✔ Movie added to personal My List.');

    console.log('[Suite 9] DELETE /api/list/157336');
    const removeListRes = await request(app)
      .delete('/api/list/157336')
      .set('Cookie', authCookie);

    if (removeListRes.status !== 200 || removeListRes.body.myList.length !== 0) {
      throw new Error('Remove from list failed');
    }
    console.log('✔ Movie removed from personal My List.');

    // --------------------------------------------------------------------------
    // 5. CONTINUE WATCHING PLAYBACK HISTORY
    // --------------------------------------------------------------------------
    console.log('[Suite 10] PUT /api/history (Upsert heartbeat)');
    const historyRes = await request(app)
      .put('/api/history')
      .set('Cookie', authCookie)
      .send({
        tmdbId: 27205,
        title: 'Inception',
        progressSeconds: 300,
        durationSeconds: 8880
      });

    if (historyRes.status !== 200 || historyRes.body.history.progressSeconds !== 300) {
      throw new Error('Upsert progress heartbeat failed');
    }
    console.log('✔ Playback heartbeat progress recorded.');

    console.log('[Suite 11] GET /api/history');
    const getHistRes = await request(app)
      .get('/api/history')
      .set('Cookie', authCookie);

    if (getHistRes.status !== 200 || getHistRes.body.count !== 1) {
      throw new Error('Failed to retrieve continue watching items');
    }
    console.log('✔ Continue watching rail populated successfully.');

    // --------------------------------------------------------------------------
    // 6. ERROR & SECURITY HANDLING
    // --------------------------------------------------------------------------
    console.log('[Suite 12] GET /api/nonexistent-route (404 test)');
    const notFoundRes = await request(app).get('/api/nonexistent-route');
    if (notFoundRes.status !== 404 || notFoundRes.body.success !== false) {
      throw new Error('404 catch-all failed');
    }
    console.log('✔ 404 catch-all returned structured error JSON.');

    console.log('====================================================');
    console.log('🎉 ALL 12 SUPERTEST INTEGRATION SUITES PASSED (100%)');
    console.log('====================================================');
  } finally {
    // Teardown
    await User.deleteMany({ email: testUser.email });
    await WatchHistory.deleteMany({});
    await disconnectDB();
  }
}

runSupertestSuite().catch((err) => {
  console.error('Supertest Suite Failed:', err);
  process.exit(1);
});
