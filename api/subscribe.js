export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        groups: ['Stack Rush Waitlist']
      })
    });

    const data = await response.json();

    // 200, 201 = success, 422 = already subscribed (also fine)
    if (response.status === 200 || response.status === 201 || response.status === 422) {
      return res.status(200).json({ success: true });
    }

    return res.status(response.status).json({ success: false, error: data.message || 'Unknown error' });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
