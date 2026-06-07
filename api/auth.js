export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== expectedPassword) {
    return res.status(401).json({ error: 'Geçersiz parola' });
  }

  return res.status(200).json({ ok: true });
}
