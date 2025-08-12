import crypto from 'crypto';

const PAYU_SUBS_BASE_URL = process.env.PAYU_SUBS_BASE_URL || 'https://api.payu.in';
const PAYU_CLIENT_ID = process.env.PAYU_CLIENT_ID || process.env.PAYU_SUBS_CLIENT_ID || '';
const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET || process.env.PAYU_SUBS_CLIENT_SECRET || '';
const WEBHOOK_URL = process.env.PAYU_SUBS_WEBHOOK_URL || 'https://growbharatvyapaar.com/api/payu/subscriptions/mandate/callback';

// Obtain access token for subscriptions API (OAuth2 Client Credentials or as per PayU provisioning)
export async function getPayuAccessToken() {
  if (!PAYU_CLIENT_ID || !PAYU_CLIENT_SECRET) {
    throw new Error('PayU Subscriptions client credentials not configured');
  }
  const url = `${PAYU_SUBS_BASE_URL}/oauth/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: PAYU_CLIENT_ID,
    client_secret: PAYU_CLIENT_SECRET,
  });
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayU token error: ${resp.status} ${text}`);
  }
  return resp.json();
}

// Create a subscription plan (amount in INR paise or rupees as per PayU config)
export async function createPayuPlan({ name, amount, intervalMonths }) {
  const token = await getPayuAccessToken();
  const url = `${PAYU_SUBS_BASE_URL}/subscriptions/plans`;
  const payload = {
    planName: name,
    amount: Number(amount),
    interval: 'MONTH',
    intervalCount: Number(intervalMonths) || 1,
    currency: 'INR',
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayU create plan error: ${resp.status} ${text}`);
  }
  return resp.json();
}

// Create a subscription instance and get mandate URL (UPI Autopay/cards)
export async function createPayuSubscription({ planId, customer, startTimeUtc, referenceId }) {
  const token = await getPayuAccessToken();
  const url = `${PAYU_SUBS_BASE_URL}/subscriptions`;
  const payload = {
    planId,
    customer: {
      name: customer?.name || 'Customer',
      email: customer?.email,
      phone: customer?.phone,
    },
    startTime: startTimeUtc || new Date().toISOString(),
    referenceId: referenceId || `sub_${Date.now()}`,
    notifyUrl: WEBHOOK_URL,
    returnUrl: customer?.returnUrl || WEBHOOK_URL,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayU create subscription error: ${resp.status} ${text}`);
  }
  return resp.json();
}

// Verify webhook signature if PayU provides signing (placeholder)
export function verifyWebhook(req) {
  // If PayU sends signature headers, verify here using shared secret
  // For now, accept payload
  return true;
}

// Parse webhook and extract mandate/subscription info
export function parseMandateWebhook(req) {
  try {
    const raw = req.body;
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // PayU sends various event types; normalize the essentials we need
    const event = payload?.event || payload?.type || '';
    const data = payload?.data || payload?.payload || payload;
    const mandate = data?.mandate || data?.subscription || data;
    const status = mandate?.status || data?.status || payload?.status || 'unknown';
    const umrn = mandate?.umrn || mandate?.umrnNumber || data?.umrn || null;
    const referenceId = mandate?.referenceId || mandate?.merchantReferenceId || data?.referenceId || null;
    const customer = mandate?.customer || data?.customer || {};
    return { event, status, umrn, referenceId, customer, raw: payload };
  } catch (e) {
    return { event: 'unknown', status: 'unknown', umrn: null, referenceId: null, customer: {}, raw: {} };
  }
}
