import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://structlearnpro.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, user_id } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id) {
    return res.status(400).json({ error: 'Missing required fields', received: Object.keys(req.body) });
  }

  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  if (!KEY_SECRET) return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET not set' });

  // Generate expected signature
  const body_str = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(body_str).digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ 
      error: 'Invalid payment signature',
      debug: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature_length: razorpay_signature?.length,
        expected_length: expected?.length,
        secret_set: !!KEY_SECRET,
        secret_length: KEY_SECRET?.length
      }
    });
  }

  // Calculate expiry
  const now = new Date();
  const expires = new Date(now);
  if (plan === 'annual') expires.setFullYear(expires.getFullYear() + 1);
  else expires.setMonth(expires.getMonth() + 1);

  // Update Supabase
  const SUPA_URL = process.env.SUPABASE_URL || 'https://rpjdveuxxjeoeomkwrfx.supabase.co';
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPA_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set' });

  try {
    const resp = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPA_KEY}`,
        'apikey': SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        plan: 'pro',
        pro_expires_at: expires.toISOString(),
        razorpay_payment_id,
        updated_at: now.toISOString()
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: 'Failed to upgrade account', supabase_error: err });
    }

    return res.status(200).json({
      success: true,
      plan: 'pro',
      expires_at: expires.toISOString(),
      payment_id: razorpay_payment_id
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
