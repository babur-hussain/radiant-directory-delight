import crypto from "crypto";

export default function handler(req, res) {
  // Robust CORS headers for all scenarios
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PATCH,DELETE,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse body (Vercel Node.js API automatically parses JSON)
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
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
  } = req.body || {};

  // Validate required fields
  if (!key || !txnid || !amount || !productinfo || !firstname || !email || !phone || !surl || !furl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Use your actual salt here or from env
  const salt = process.env.PAYU_SALT || "YOUR_LIVE_SALT";

  // Construct hash string as per PayU docs
  const hashString = [
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
    salt
  ].join('|');

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  // Return all required PayU fields for form submission
  return res.status(200).json({
    payuBaseUrl: "https://secure.payu.in/_payment",
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
} 