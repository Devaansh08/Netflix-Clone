/**
 * @file test-phase2.js
 * @description Integration verification test suite for Phase 2 Authentication.
 */

import http from 'http';
import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import User from './src/models/User.js';

const PORT = 5006;

async function runTests() {
  console.log('--- Phase 2 Authentication Test Suite ---');

  // 1. Connect to DB
  await connectDB();

  // Clear previous test users
  await User.deleteMany({ email: /.*@phase2test\.com/ });

  // 2. Start HTTP server
  const server = app.listen(PORT);

  const request = (path, method = 'GET', body = null, cookie = null) => {
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
              body: parsed,
              cookies: res.headers['set-cookie']
            });
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    const testUser = {
      name: 'Sarah Connor',
      email: 'sarah@phase2test.com',
      password: 'StrongPassword123!'
    };

    // Test 1: User Signup
    console.log('[Test 1] Testing POST /api/auth/signup...');
    const signupRes = await request('/api/auth/signup', 'POST', testUser);
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Body:', signupRes.body);

    if (signupRes.status !== 201 || !signupRes.body.success) {
      throw new Error(`Signup failed with status ${signupRes.status}`);
    }
    if (signupRes.body.user.password) {
      throw new Error('SECURITY VIOLATION: Password hash leaked in signup response!');
    }
    if (!signupRes.cookies || !signupRes.cookies.some(c => c.includes('token=') && c.includes('HttpOnly'))) {
      throw new Error('SECURITY VIOLATION: httpOnly token cookie missing in Set-Cookie header!');
    }
    console.log('✔ Signup succeeded and issued httpOnly cookie.');

    // Test 2: Duplicate Signup Prevention
    console.log('[Test 2] Testing duplicate email signup...');
    const dupRes = await request('/api/auth/signup', 'POST', testUser);
    console.log('Duplicate Signup Status:', dupRes.status);
    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 Conflict on duplicate email, got ${dupRes.status}`);
    }
    console.log('✔ Duplicate email prevented with 409 Conflict.');

    // Test 3: Bad Password Login
    console.log('[Test 3] Testing POST /api/auth/login with wrong password...');
    const badLoginRes = await request('/api/auth/login', 'POST', {
      email: testUser.email,
      password: 'IncorrectPassword'
    });
    console.log('Bad Login Status:', badLoginRes.status);
    if (badLoginRes.status !== 401) {
      throw new Error(`Expected 401 on bad password, got ${badLoginRes.status}`);
    }
    console.log('✔ Bad password rejected with 401 Unauthorized.');

    // Test 4: Successful Login
    console.log('[Test 4] Testing POST /api/auth/login with valid credentials...');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200 || !loginRes.body.success) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const authCookie = loginRes.cookies.find(c => c.startsWith('token=')).split(';')[0];
    console.log('Auth Cookie Extracted:', authCookie);
    console.log('✔ Login successful and issued httpOnly cookie.');

    // Test 5: Protected Route Access without Cookie
    console.log('[Test 5] Testing GET /api/auth/me without cookie...');
    const unauthRes = await request('/api/auth/me', 'GET');
    console.log('Unauth /me Status:', unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 on unauthenticated /me, got ${unauthRes.status}`);
    }
    console.log('✔ Unauthenticated access to /me properly blocked with 401.');

    // Test 6: Protected Route Access with Cookie
    console.log('[Test 6] Testing GET /api/auth/me with auth cookie...');
    const meRes = await request('/api/auth/me', 'GET', null, authCookie);
    console.log('Auth /me Status:', meRes.status);
    console.log('Auth /me Body:', meRes.body);
    if (meRes.status !== 200 || meRes.body.user.email !== testUser.email) {
      throw new Error(`Failed to retrieve user profile via auth cookie`);
    }
    console.log('✔ Authenticated /me succeeded with user profile.');

    // Test 7: Logout
    console.log('[Test 7] Testing POST /api/auth/logout...');
    const logoutRes = await request('/api/auth/logout', 'POST');
    console.log('Logout Status:', logoutRes.status);
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed with status ${logoutRes.status}`);
    }
    console.log('✔ Logout succeeded.');

    console.log('\n🎉 ALL PHASE 2 AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    // Cleanup test data
    await User.deleteMany({ email: /.*@phase2test\.com/ });
    server.close();
    await disconnectDB();
  }
}

runTests().catch((err) => {
  console.error('Phase 2 Tests Failed:', err);
  process.exit(1);
});
