const crypto = require("crypto");

// Simple in-memory rate limit (per function instance)
let lastRequestTime = 0;

// Helper to build the canonical hash string in PayU's required order
function buildRequestHashString({ key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10, salt }) {
  const parts = [
    String(key),
    String(txnid),
    String(amount),
    String(productinfo),
    String(firstname),
    String(email),
    String(udf1 || ''),
    String(udf2 || ''),
    String(udf3 || ''),
    String(udf4 || ''),
    String(udf5 || ''),
    String(udf6 || ''),
    String(udf7 || ''),
    String(udf8 || ''),
    String(udf9 || ''),
    String(udf10 || ''),
    String(salt)
  ];
  return parts.join('|').trim();
}

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone = '',
    si,
    si_details,
    // Force udf1-udf5 empty to match working packages
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    // Note: udf6-udf10 are intentionally NOT used in request hash
    // FORCE empty for hashing and outgoing params
    udf6 = '',
    udf7 = '',
    udf8 = '',
    udf9 = '',
    udf10 = '',
    surl,
    furl,
  } = req.body || {};

  if (!txnid || !amount || !productinfo || !firstname || !email || !surl || !furl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Apply instance-level throttle: 1 request per 3 seconds
  const now = Date.now();
  if (now - lastRequestTime < 3000) {
    return res.status(429).json({ error: "Rate limit exceeded. Please try again in a few seconds." });
  }
  lastRequestTime = now;

  // Environment detection (default to production)
  const env = (process.env.PAYU_ENV || process.env.NODE_ENV || "production").toLowerCase();
  let isTestEnv = env === 'test' || env === 'development';

  // Use appropriate credentials based on environment, with safe fallbacks to LIVE values
  let key, saltV1, saltV2, saltIndex;

  if (isTestEnv) {
    key = process.env.PAYU_TEST_KEY || 'gtKFFx';
    saltV1 = process.env.PAYU_TEST_SALT_V1 || '4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW';
    saltV2 = process.env.PAYU_TEST_SALT_V2 || process.env.PAYU_TEST_SALT || 'eCwWELxi';
    saltIndex = process.env.PAYU_TEST_SALT_INDEX || '1';
  } else {
    // Production: prefer env; fallback to provided live credentials if missing
    key = process.env.PAYU_KEY || 'i0514X';
    saltV1 = process.env.PAYU_SALT_V1 || process.env.PAYU_SALT || 'vbUDAmcCKBw9FizOXa3saBvIXMqW1gn9';
    saltV2 = process.env.PAYU_SALT_V2 || process.env.PAYU_SALT || 'Mn2t0YCJqlt8DokqT6flbIGujez9Hbos';
    saltIndex = process.env.PAYU_SALT_INDEX || '1';
  }

  // If the selected key matches the LIVE key, force production mode for PayU URL
  if (key === 'i0514X') {
    isTestEnv = false;
  }

  // Build v1 and v2 request hash strings
  // Normalize inputs exactly like working packages: amount as 2-decimals string, ascii-safe productinfo
  const normalizeAscii = (s) => String(s || '')
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\u00A0-\u00BF]/g, ' ')
    .replace(/[\u20B9\uFE0F]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  const amt = Number(String(amount).replace(/[^0-9.]/g, '') || '0').toFixed(2);
  const pinfo = normalizeAscii(productinfo);
  const baseParams = { key, txnid, amount: amt, productinfo: pinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10 };
  const hashStringV1 = buildRequestHashString({ ...baseParams, salt: saltV1 });
  const hashStringV2 = buildRequestHashString({ ...baseParams, salt: saltV2 });

  // Generate hashes
  const v1 = crypto.createHash('sha512').update(hashStringV1, 'utf-8').digest('hex');
  const v2 = crypto.createHash('sha512').update(hashStringV2, 'utf-8').digest('hex');

  // Prefer sending v2 hex directly to avoid illegal character issues with JSON in some accounts
  const hash = v2;

  // Minimal debug in non-production
  if (isTestEnv) {
    console.log('PayU hash V1 string:', hashStringV1);
    console.log('PayU hash V2 string:', hashStringV2);
    console.log('PayU hash values:', { v1, v2 });
  }

  return res.status(200).json({
    payuBaseUrl: isTestEnv ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment",
    key,
    txnid,
    amount: amt,
    productinfo: pinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
    ...(si ? { si: String(si) } : {}),
    ...(si_details ? { si_details: String(si_details) } : {}),
    udf1: udf1 || '',
    udf2: udf2 || '',
    udf3: udf3 || '',
    udf4: udf4 || '',
    udf5: udf5 || '',
    udf6: udf6 || '',
    udf7: udf7 || '',
    udf8: udf8 || '',
    udf9: udf9 || '',
    udf10: udf10 || '',
    salt_index: String(saltIndex),
    hash
  });
};
