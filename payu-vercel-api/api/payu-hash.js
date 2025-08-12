const crypto = require("crypto");

// Simple in-memory rate limit (per function instance)
let lastRequestTime = 0;

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
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
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

  // Use server-side credentials
  const key = process.env.PAYU_KEY || "JPM7Hr12"; // Do NOT rely on client-provided key
  const salt = process.env.PAYU_SALT || "vbUDAmcCKBw9FizOXa3saBvIXMqW1gn9";
  const env = (process.env.PAYU_ENV || "test").toLowerCase();

  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
    salt
  ].join('|');

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return res.status(200).json({
    payuBaseUrl: env === 'prod' || env === 'production' ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment",
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
    hash
  });
};
