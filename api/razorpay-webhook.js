import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).json({ error: 'Webhook secret not configured' });

  // Verify webhook signature
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

  if (expected !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body;
  const SUPA_URL = 'https://rpjdveuxxjeoeomkwrfx.supabase.co';
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    // Handle payment captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const profileId = payment.notes?.profile_id;
      const plan = payment.notes?.plan || 'monthly';

      if (profileId) {
        const now = new Date();
        const expires = new Date(now);
        if (plan === 'annual') expires.setFullYear(expires.getFullYear() + 1);
        else expires.setMonth(expires.getMonth() + 1);

        await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${profileId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${SUPA_KEY}`, 'apikey': SUPA_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'pro', pro_expires_at: expires.toISOString(), razorpay_payment_id: payment.id, updated_at: now.toISOString() })
        });

        // Record in payment_history
        await fetch(`${SUPA_URL}/rest/v1/payment_history`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPA_KEY}`, 'apikey': SUPA_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, razorpay_payment_id: payment.id, amount: payment.amount, plan, status: 'success' })
        }).catch(() => {});
      }
    }

    // Handle payment failed event
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const profileId = payment.notes?.profile_id;
      const plan = payment.notes?.plan || 'monthly';

      if (profileId) {
        await fetch(`${SUPA_URL}/rest/v1/payment_history`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPA_KEY}`, 'apikey': SUPA_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, razorpay_payment_id: payment.id, amount: payment.amount, plan, status: 'failed', failure_reason: payment.error_description })
        }).catch(() => {});
      }
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: e.message });
  }
}
