import crypto from "crypto";

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

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    amount, productinfo, firstname, email, phone, surl, furl, txnid,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
    udf6 = '', udf7 = '', udf8 = '', udf9 = '', udf10 = ''
  } = req.body || {};

  if (!amount || !productinfo || !firstname || !email || !phone || !surl || !furl || !txnid) {
    return res.status(400).json({ error: "Missing required payment parameters" });
  }

  const env = (process.env.PAYU_ENV || process.env.NODE_ENV || 'production').toLowerCase();
  let isTestEnv = env === 'test' || env === 'development';

  // Keys and salts
  const key = isTestEnv
    ? (process.env.PAYU_TEST_KEY || 'gtKFFx')
    : (process.env.PAYU_MERCHANT_KEY || 'i0514X');
  const saltV1 = isTestEnv
    ? (process.env.PAYU_TEST_SALT_V1 || '4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW')
    : (process.env.PAYU_MERCHANT_SALT_V1 || process.env.PAYU_MERCHANT_SALT || 'vbUDAmcCKBw9FizOXa3saBvIXMqW1gn9');
  const saltV2 = isTestEnv
    ? (process.env.PAYU_TEST_SALT_V2 || process.env.PAYU_TEST_SALT || 'eCwWELxi')
    : (process.env.PAYU_MERCHANT_SALT_V2 || process.env.PAYU_MERCHANT_SALT || 'Mn2t0YCJqlt8DokqT6flbIGujez9Hbos');
  const saltIndex = isTestEnv ? (process.env.PAYU_TEST_SALT_INDEX || '1') : (process.env.PAYU_SALT_INDEX || '1');

  // If key is live key, force production PayU URL
  if (key === 'i0514X') {
    isTestEnv = false;
  }

  if (!key || !saltV1 || !saltV2) {
    return res.status(500).json({ error: 'PayU credentials not configured' });
  }

  const params = {
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
    udf6: String(udf6),
    udf7: String(udf7),
    udf8: String(udf8),
    udf9: String(udf9),
    udf10: String(udf10),
  };

  const hashStringV1 = buildRequestHashString({
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
    salt: saltV1,
  });

  const hashStringV2 = buildRequestHashString({
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
    salt: saltV2,
  });

  const v1 = crypto.createHash('sha512').update(hashStringV1, 'utf-8').digest('hex');
  const v2 = crypto.createHash('sha512').update(hashStringV2, 'utf-8').digest('hex');
  const hash = JSON.stringify({ v1, v2 });

  return res.status(200).json({
    ...params,
    salt_index: String(saltIndex),
    hash,
    payuBaseUrl: isTestEnv ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment',
  });
}