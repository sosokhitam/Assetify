const url = 'http://localhost:5000';

const adminBody = JSON.stringify({ email: 'admin@samsat.go.id', password: 'password123' });
const pegawaiBody = JSON.stringify({ nip: '199501012024011001', password: 'password123' });

for (const [path, body] of [['/api/auth/admin/login', adminBody], ['/api/auth/login', pegawaiBody]]) {
  try {
    const res = await fetch(url + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const text = await res.text();
    console.log('PATH', path, 'STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error('PATH', path, 'ERROR', err);
  }
}
