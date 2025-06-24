import crypto from 'crypto';

// PayU credentials (LIVE)
const PAYU_MERCHANT_KEY = 'i0514X';
const PAYU_MERCHANT_SALT = 'vbUDAmcCKBw9FizOXa3saBvIXMqW1gn9';

/**
 * Generate PayU hash for a given set of parameters (v1)
 * @param {Object} params - Payment params (key, txnid, amount, productinfo, firstname, email, etc.)
 * @returns {string} - Hash string
 */
export function generatePayUHash(params) {
  // The sequence/order of fields is critical for hash generation
  // Refer: https://docs.payu.in/docs/custom-checkout-merchant-hosted#hash-generation
  const hashString = [
    String(params.key),
    String(params.txnid),
    String(params.amount),
    String(params.productinfo),
    String(params.firstname),
    String(params.email),
    String(params.udf1 || ''),
    String(params.udf2 || ''),
    String(params.udf3 || ''),
    String(params.udf4 || ''),
    String(params.udf5 || ''),
    String(params.udf6 || ''),
    String(params.udf7 || ''),
    String(params.udf8 || ''),
    String(params.udf9 || ''),
    String(params.udf10 || ''),
    PAYU_MERCHANT_SALT
  ].join('|');
  const trimmedHashString = hashString.trim();
  const hash = crypto.createHash('sha512').update(trimmedHashString, 'utf-8').digest('hex');
  console.log('PayU hash string:', JSON.stringify(trimmedHashString));
  console.log('PayU hash value:', hash);
  return hash;
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