# PayU Configuration Guide

## Environment Setup

### 1. Test Environment (Development)
For development and testing, the system automatically uses PayU's test credentials:
- **Key**: `gtKFFx`
- **Salt**: `eCwWELxi`
- **Base URL**: `https://test.payu.in/_payment`

### 2. Production Environment
For live payments, you need to set these environment variables:

```bash
# Set environment to production
PAYU_ENV=production

# Your production credentials from PayU
PAYU_KEY=your_actual_production_key
PAYU_SALT=your_actual_production_salt
```

## Vercel Deployment

### Environment Variables
Set these in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PAYU_ENV` | `production` | Environment setting |
| `PAYU_KEY` | Your PayU key | Production merchant key |
| `PAYU_SALT` | Your PayU salt | Production merchant salt |

### Important Notes
- **Never commit production credentials** to your repository
- **Test thoroughly** in test environment before switching to production
- **Monitor transactions** in PayU dashboard after going live
- **Keep credentials secure** and rotate them periodically

## Hash Calculation

The system automatically calculates the hash using PayU's formula:
```
sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT)
```

All UDF fields are properly handled as empty strings when undefined.

## Rate Limiting

- **Instance-level**: 1 request per 3 seconds per function instance
- **Client-side**: 1 request per 3 seconds per client
- **Queue system**: Prevents concurrent payment bursts

## Troubleshooting

### Common Issues
1. **"Incorrect key or salt"**: Check environment variables and credentials
2. **"Hash calculation error"**: Verify UDF field values are strings
3. **"Rate limit exceeded"**: Wait 3 seconds between requests

### Support
- **Test Environment**: Use PayU test credentials
- **Production Issues**: Contact your PayU account manager
- **Technical Support**: Check PayU API documentation
