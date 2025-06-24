const crypto = require("crypto");

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
  } = req.body || {};

  if (!key || !txnid || !amount || !productinfo || !firstname || !email || !surl || !furl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const salt = process.env.PAYU_SALT || "YOUR_LIVE_SALT";

  // Official PayU merchant-hosted hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
  const hashString = [
    key, txnid, amount, productinfo, firstname, email,
    udf1, udf2, udf3, udf4, udf5,
    '', '', '', '', '', // udf6-udf10 as empty strings
    salt
  ].map(v => v === undefined || v === null ? '' : String(v)).join('|');

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return res.status(200).json({
    payuBaseUrl: "https://secure.payu.in/_payment",
    key: String(key),
    txnid: String(txnid),
    amount: String(amount),
    productinfo: String(productinfo),
    firstname: String(firstname),
    email: String(email),
    phone: String(phone),
    surl: String(surl),
    furl: String(furl),
    udf1: String(udf1),
    udf2: String(udf2),
    udf3: String(udf3),
    udf4: String(udf4),
    udf5: String(udf5),
    hash
  });
}; 