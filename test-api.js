
// using global fetch


async function testApi() {
  const url = 'http://localhost:3000/api/auth/signup';
  const indexNumber = 'UPSA' + Math.floor(10000000 + Math.random() * 90000000);
  const email = `api_test_${Date.now()}@example.com`;
  
  const payload = {
    indexNumber: indexNumber,
    dateOfBirth: '2000-01-01',
    phone: '+233123456789',
    email: email
  };

  console.log('Sending payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testApi();
