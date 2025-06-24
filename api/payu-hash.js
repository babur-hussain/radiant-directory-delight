import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    amount, productinfo, firstname, email, phone, surl, furl, txnid,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
    udf6 = '', udf7 = '', udf8 = '', udf9 = '', udf10 = ''
  } = req.body;

  // Use your LIVE PayU credentials here
  const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
  const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

  if (!amount || !productinfo || !firstname || !email || !phone || !surl || !furl || !txnid) {
    return res.status(400).json({ error: "Missing required payment parameters" });
  }

  const params = {
    key: PAYU_MERCHANT_KEY,
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

  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1,
    params.udf2,
    params.udf3,
    params.udf4,
    params.udf5,
    params.udf6,
    params.udf7,
    params.udf8,
    params.udf9,
    params.udf10,
    PAYU_MERCHANT_SALT
  ].join('|').trim();

  const hash = crypto.createHash('sha512').update(hashString, 'utf-8').digest('hex');

  return res.status(200).json({
    ...params,
    hash,
    payuBaseUrl: 'https://secure.payu.in/_payment'
  });
} 