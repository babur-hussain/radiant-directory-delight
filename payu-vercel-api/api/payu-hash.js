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

  // Environment detection
  const env = (process.env.PAYU_ENV || "test").toLowerCase();
  const isTestEnv = env === 'test' || env === 'development' || process.env.NODE_ENV === 'development';
  
  // Use appropriate credentials based on environment
  let key, salt;
  
  if (isTestEnv) {
    // Test environment credentials
    key = process.env.PAYU_TEST_KEY || "gtKFFx";
    salt = process.env.PAYU_TEST_SALT || "eCwWELxi";
  } else {
    // Production environment credentials
    key = process.env.PAYU_KEY;
    salt = process.env.PAYU_SALT;
    
    if (!key || !salt) {
      return res.status(500).json({ error: "Production PayU credentials not configured" });
    }
  }
  
  // PayU hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT)
  // All UDFs must be strings, empty strings for undefined values
  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 || '',
    udf2 || '',
    udf3 || '',
    udf4 || '',
    udf5 || '',
    udf6 || '',
    udf7 || '',
    udf8 || '',
    udf9 || '',
    udf10 || '',
    salt
  ].join('|');

  // Debug: Log the hash string for verification
  console.log('Hash String:', hashString);
  console.log('Hash String Length:', hashString.length);

  // Generate both v1 and v2 hashes as expected by PayU
  const hashV1 = crypto.createHash('sha512').update(hashString).digest('hex');
  
  // For v2, some implementations use a different approach - let's try the same hash for now
  // If this doesn't work, we may need to adjust based on PayU's specific requirements
  const hashV2 = crypto.createHash('sha512').update(hashString + '|' + salt).digest('hex');
  
  // Return hash in the format PayU expects: {"v1":"hash1","v2":"hash2"}
  const hash = JSON.stringify({
    v1: hashV1,
    v2: hashV2
  });

  console.log('Generated Hash V1:', hashV1);
  console.log('Generated Hash V2:', hashV2);
  console.log('Final Hash JSON:', hash);

  return res.status(200).json({
    payuBaseUrl: isTestEnv ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment",
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
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
    hash
  });
};

// Simple in-memory rate limit (per function instance)
let lastRequestTime = 0;
