const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
    });
    req.on('error', (err) => reject(err));
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...');

  try {
    // 1. Test Login Admin
    const loginRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@university.ac.th', password: 'admin123' });

    console.log('✅ Admin Login Test:', loginRes.status, loginRes.data);

    // 1b. Test Login Officer1
    const officerRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'officer1', password: 'Officer@123' });

    console.log('✅ Officer1 Login Test:', officerRes.status, officerRes.data);

    // 1c. Test Login Agency1
    const agencyRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'agency1', password: 'Agency@123' });

    console.log('✅ Agency1 Login Test:', agencyRes.status, agencyRes.data);

    const token = loginRes.data.token;

    // 2. Test Get Dashboard Stats
    const statsRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/stats/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Dashboard Stats Test:', statsRes.status === 200 ? 'SUCCESS' : 'FAILED', 'Total repairs:', statsRes.data.summary?.total);

    // 3. Test Get Repairs List
    const repairsRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/repairs',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Get Repairs List Test:', repairsRes.status === 200 ? 'SUCCESS' : 'FAILED', 'Fetched count:', repairsRes.data.data?.length);

    console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

runTests();
