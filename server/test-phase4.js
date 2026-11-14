/**
 * @file test-phase4.js
 * @description Integration verification test suite for Phase 4 My List and Watch History.
 */

import http from 'http';
import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import User from './src/models/User.js';
import WatchHistory from './src/models/WatchHistory.js';

const PORT = 5008;

async function runTests() {
  console.log('--- Phase 4 User Features (My List & Continue Watching) Test Suite ---');

  await connectDB();

  // Create clean test user
  await User.deleteMany({ email: 'userfeatures@phase4.com' });
  const testUser = await User.create({
    name: 'Feature Tester',
    email: 'userfeatures@phase4.com',
    password: 'Password123!'
  });
  await WatchHistory.deleteMany({ user: testUser._id });

  const token = testUser.generateAuthToken();
  const authCookie = `token=${token}`;

  const server = app.listen(PORT);

  const request = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      };

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
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Add to My List
    console.log('[Test 1] Testing POST /api/list (Adding Interstellar)...');
    const addRes = await request('/api/list', 'POST', {
      tmdbId: 157336,
      title: 'Interstellar',
      posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    });
    console.log('Add Status:', addRes.status);
    console.log('Add Body:', addRes.body);
    if (addRes.status !== 200 || addRes.body.myList?.length !== 1) {
      throw new Error('Failed to add movie to My List');
    }
    console.log('✔ Movie added to My List successfully.');

    // 2. Add Duplicate to My List
    console.log('[Test 2] Testing duplicate add to My List (Set Uniqueness Check)...');
    const dupRes = await request('/api/list', 'POST', {
      tmdbId: 157336,
      title: 'Interstellar',
      posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    });
    console.log('Duplicate Add Status:', dupRes.status);
    if (dupRes.status !== 200 || dupRes.body.myList?.length !== 1) {
      throw new Error('Duplicate item was wrongly added to My List!');
    }
    console.log('✔ Duplicate prevention verified: My List remains at 1 unique item.');

    // 3. Fetch My List
    console.log('[Test 3] Testing GET /api/list...');
    const listRes = await request('/api/list', 'GET');
    console.log('List Items Count:', listRes.body.count);
    if (listRes.status !== 200 || listRes.body.count !== 1) {
      throw new Error('Failed to retrieve user list');
    }
    console.log('✔ My List retrieved successfully.');

    // 4. Remove from My List
    console.log('[Test 4] Testing DELETE /api/list/157336...');
    const removeRes = await request('/api/list/157336', 'DELETE');
    console.log('Remove Status:', removeRes.status);
    if (removeRes.status !== 200 || removeRes.body.myList?.length !== 0) {
      throw new Error('Failed to remove item from My List');
    }
    console.log('✔ Removed movie from My List successfully.');

    // 5. Record Video Playback Progress (Heartbeat 1)
    console.log('[Test 5] Testing PUT /api/history (Playback Heartbeat 1)...');
    const historyRes1 = await request('/api/history', 'PUT', {
      tmdbId: 27205,
      title: 'Inception',
      posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      progressSeconds: 120,
      durationSeconds: 9000
    });
    console.log('History 1 Status:', historyRes1.status);
    console.log('Recorded Progress:', historyRes1.body.history?.progressSeconds);
    if (historyRes1.status !== 200 || historyRes1.body.history?.progressSeconds !== 120) {
      throw new Error('Failed to record initial playback progress');
    }
    console.log('✔ Playback progress recorded.');

    // 6. Upsert Video Playback Progress (Heartbeat 2)
    console.log('[Test 6] Testing PUT /api/history (Upsert Heartbeat 2: progress to 450s)...');
    const historyRes2 = await request('/api/history', 'PUT', {
      tmdbId: 27205,
      title: 'Inception',
      posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      progressSeconds: 450,
      durationSeconds: 9000
    });
    console.log('History 2 Progress:', historyRes2.body.history?.progressSeconds);
    if (historyRes2.status !== 200 || historyRes2.body.history?.progressSeconds !== 450) {
      throw new Error('Failed to upsert updated progress');
    }
    console.log('✔ Progress upserted successfully without duplicating records.');

    // 7. Get Continue Watching Feed
    console.log('[Test 7] Testing GET /api/history...');
    const getHistoryRes = await request('/api/history', 'GET');
    console.log('Continue Watching Feed Count:', getHistoryRes.body.count);
    if (getHistoryRes.status !== 200 || getHistoryRes.body.count !== 1) {
      throw new Error('Continue watching feed failed');
    }
    console.log('✔ Continue watching rail retrieved successfully.');

    // 8. Test Video Completion Threshold (> 95%)
    console.log('[Test 8] Testing completion threshold (progress = 8900s / 9000s)...');
    await request('/api/history', 'PUT', {
      tmdbId: 27205,
      title: 'Inception',
      posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      progressSeconds: 8900,
      durationSeconds: 9000
    });
    const completedHistoryRes = await request('/api/history', 'GET');
    console.log('Active Continue Watching Count after 95% Completion:', completedHistoryRes.body.count);
    if (completedHistoryRes.body.count !== 0) {
      throw new Error('Completed movie was not pruned from continue watching rail');
    }
    console.log('✔ Movie marked completed and cleaned from Continue Watching rail.');

    console.log('\n🎉 ALL PHASE 4 USER FEATURE TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    await User.deleteMany({ email: 'userfeatures@phase4.com' });
    await WatchHistory.deleteMany({ user: testUser._id });
    server.close();
    await disconnectDB();
  }
}

runTests().catch((err) => {
  console.error('Phase 4 Tests Failed:', err);
  process.exit(1);
});
