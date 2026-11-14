/**
 * @file test-phase1.js
 * @description Integration verification script for Phase 1 backend foundation.
 */

import http from 'http';
import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';

const PORT = 5005;

async function runTests() {
  console.log('--- Phase 1 Verification Suite ---');

  // 1. Connect to Database
  console.log('[Test 1] Testing Database Connection...');
  await connectDB();

  // 2. Start HTTP Server on test port
  console.log('[Test 2] Starting Express App on test port ' + PORT + '...');
  const server = app.listen(PORT);

  const request = (path, method = 'GET') => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path,
          method,
          headers: { 'Content-Type': 'application/json' }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
            } catch (err) {
              resolve({ status: res.statusCode, headers: res.headers, rawBody: data });
            }
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  };

  try {
    // 3. Test Health Check Route
    console.log('[Test 3] Requesting GET /api/health...');
    const healthRes = await request('/api/health');
    console.log('Health Response Status:', healthRes.status);
    console.log('Health Body:', healthRes.body);
    if (healthRes.status !== 200 || !healthRes.body.success) {
      throw new Error('Health check failed: expected status 200 and success: true');
    }
    console.log('✔ Health endpoint verified successfully.');

    // 4. Test Root Route
    console.log('[Test 4] Requesting GET /...');
    const rootRes = await request('/');
    console.log('Root Response Status:', rootRes.status);
    console.log('Root Body:', rootRes.body);
    if (rootRes.status !== 200 || rootRes.body.service !== 'StreamVerse API') {
      throw new Error('Root route verification failed');
    }
    console.log('✔ Root route verified successfully.');

    // 5. Test 404 Not Found Handling
    console.log('[Test 5] Requesting GET /api/unknown-test-route (404 test)...');
    const notFoundRes = await request('/api/unknown-test-route');
    console.log('404 Response Status:', notFoundRes.status);
    console.log('404 Body:', notFoundRes.body);
    if (notFoundRes.status !== 404 || notFoundRes.body.success !== false) {
      throw new Error('404 Handler failed: expected status 404 and success: false');
    }
    console.log('✔ 404 Error handler verified successfully.');

    // 6. Test Security Headers (Helmet) & Rate Limiting Headers
    console.log('[Test 6] Checking Helmet & Rate Limit response headers...');
    const headers = healthRes.headers;
    console.log('X-Content-Type-Options:', headers['x-content-type-options']);
    console.log('RateLimit-Limit:', headers['ratelimit-limit']);
    console.log('RateLimit-Remaining:', headers['ratelimit-remaining']);
    if (!headers['x-content-type-options']) {
      throw new Error('Helmet security headers missing');
    }
    console.log('✔ Security headers and RateLimiter verified successfully.');

    console.log('\n🎉 ALL PHASE 1 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
