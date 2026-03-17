fetch('http://localhost:3000/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'test_user', userEmail: 'test@example.com' })
}).then(r => r.json()).then(console.log).catch(console.error);
