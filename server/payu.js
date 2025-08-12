import crypto from 'crypto';

// PayU credentials via environment for security
const ENV = (process.env.PAYU_ENV || process.env.NODE_ENV || 'production').toLowerCase();
let IS_TEST = ENV === 'test' || ENV === 'development';

const PAYU_MERCHANT_KEY = IS_TEST
  ? (process.env.PAYU_TEST_KEY || 'gtKFFx')
  : (process.env.PAYU_KEY || 'i0514X');

// Support v1/v2 salts; fall back if only one provided
const PAYU_SALT_V1 = IS_TEST
  ? (process.env.PAYU_TEST_SALT_V1 || '4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW')
  : (process.env.PAYU_SALT_V1 || process.env.PAYU_SALT || 'vbUDAmcCKBw9FizOXa3saBvIXMqW1gn9');
const PAYU_SALT_V2 = IS_TEST
  ? (process.env.PAYU_TEST_SALT_V2 || process.env.PAYU_TEST_SALT || 'eCwWELxi')
  : (process.env.PAYU_SALT_V2 || process.env.PAYU_SALT || 'Mn2t0YCJqlt8DokqT6flbIGujez9Hbos');

// If live key is set, treat as production
if (PAYU_MERCHANT_KEY === 'i0514X') {
  IS_TEST = false;
}

/**
 * Generate PayU hash for a given set of parameters (v1)
 * @param {Object} params - Payment params (key, txnid, amount, productinfo, firstname, email, etc.)
 * @returns {string} - Hash string
 */
function buildRequestHashString({ key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10, salt }) {
  return [
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
  ].join('|').trim();
}

export function generatePayUHash(params) {
  // Generate both v1 and v2 hashes as JSON string
  const base = {
    key: params.key,
    txnid: params.txnid,
    amount: params.amount,
    productinfo: params.productinfo,
    firstname: params.firstname,
    email: params.email,
    udf1: params.udf1,
    udf2: params.udf2,
    udf3: params.udf3,
    udf4: params.udf4,
    udf5: params.udf5,
    udf6: params.udf6,
    udf7: params.udf7,
    udf8: params.udf8,
    udf9: params.udf9,
    udf10: params.udf10,
  };
  const v1Str = buildRequestHashString({ ...base, salt: PAYU_SALT_V1 });
  const v2Str = buildRequestHashString({ ...base, salt: PAYU_SALT_V2 });
  const v1 = crypto.createHash('sha512').update(v1Str, 'utf-8').digest('hex');
  const v2 = crypto.createHash('sha512').update(v2Str, 'utf-8').digest('hex');
  return JSON.stringify({ v1, v2 });
}

/**
 * Get PayU merchant key (for frontend)
 */
export function getPayUMerchantKey() {
  return PAYU_MERCHANT_KEY;
}

/**
 * Ensure all required PayU params are present for the form POST
 */
export function buildPayUParams(params) {
  return {
    key: params.key,
    txnid: params.txnid,
    amount: params.amount,
    productinfo: params.productinfo,
    firstname: params.firstname,
    email: params.email,
    phone: params.phone,
    surl: params.surl,
    furl: params.furl,
    hash: params.hash,
    salt_index: String(process.env.PAYU_SALT_INDEX || process.env.PAYU_TEST_SALT_INDEX || '1'),
    udf1: params.udf1,
    udf2: params.udf2,
    udf3: params.udf3,
    udf4: params.udf4,
    udf5: params.udf5,
    udf6: params.udf6,
    udf7: params.udf7,
    udf8: params.udf8,
    udf9: params.udf9,
    udf10: params.udf10,
  };
} 