export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://structlearnpro.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan } = req.body; // 'monthly' or 'annual'
  if (!plan) return res.status(400).json({ error: 'Plan required' });

  // Amount in paise (from env or defaults)
  const PRICES = {
    monthly: parseInt(process.env.PRICE_MONTHLY || '19900'),  // ₹199
    annual:  parseInt(process.env.PRICE_ANNUAL  || '199900'), // ₹1999
  };

  const amount = PRICES[plan];
  if (!amount || amount < 100) return res.status(400).json({ error: 'Invalid plan' });

  const KEY_ID     = process.env.RAZORPAY_KEY_ID;
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  if (!KEY_ID || !KEY_SECRET) return res.status(500).json({ error: 'Razorpay not configured' });

  try {
    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `slp_${plan}_${Date.now()}`,
        notes: { plan }
      })
    });
    const order = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: order.error?.description || 'Order creation failed' });
    return res.status(200).json({ order_id: order.id, amount: order.amount, currency: order.currency, plan });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
