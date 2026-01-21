# API Rate Limiting Implementation Guide

## Overview

This document describes the API rate limiting implementation in the MA Malnu Kananga backend, designed to prevent abuse and ensure system stability.

## Architecture

### Components

1. **RateLimiter Class** (`worker.js`)
   - Sliding window algorithm implementation
   - Cloudflare Workers KV for distributed storage
   - Configurable limits per endpoint type

2. **Rate Limit Middleware**
   - Applied globally in fetch handler
   - Checks limits before route processing
   - Adds rate limit headers to all responses

3. **KV Namespace Storage**
   - `rate_limit:${identifier}` key pattern
   - Stores request timestamps
   - Automatic expiration based on window size

## Rate Limit Configuration

### Endpoint Categories

| Category | Requests/Minute | Window | Endpoints |
|----------|-----------------|---------|-----------|
| **Auth** | 5 | 1 minute | `/api/auth/*` |
| **Upload** | 10 | 1 minute | `/api/files/upload`, `/ws` |
| **Sensitive** | 20 | 1 minute | `/api/email/send`, non-GET `/api/users` |
| **Default** | 100 | 1 minute | All other endpoints |

### Why These Limits?

- **Auth (5/min)**: Prevents brute force attacks on login
- **Upload (10/min)**: Controls resource usage for large file uploads
- **Sensitive (20/min)**: Limits operations that modify user data
- **Default (100/min)**: Allows normal API usage while preventing abuse

## API Response Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2026-01-21T12:00:00.000Z
```

When rate limited, additional header is added:

```
Retry-After: 60
```

### Header Descriptions

- `X-RateLimit-Limit`: Maximum requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp when window resets
- `Retry-After`: Seconds until client can retry (only when rate limited)

## Rate Limit Response

When a client exceeds the rate limit:

```json
{
  "error": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  "message": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  "retryAfter": 60
}
```

HTTP Status Code: `429 Too Many Requests`

## Identifier Selection

Rate limiting uses different identifiers based on request type:

1. **Authenticated Requests**: Uses `user_id` from JWT token
2. **Unauthenticated Requests**: Uses client IP address (from `CF-Connecting-IP` header)
3. **Fallback**: Uses `'unknown'` if IP not available

This ensures:
- Per-user limits when authenticated
- Per-IP limits when not authenticated
- Distributed tracking across Cloudflare edge locations

## Sliding Window Algorithm

### How It Works

1. Each request timestamp is stored in KV
2. Requests older than the window are filtered out
3. Current request count = recent timestamps within window
4. If count < limit: Allow request and store new timestamp
5. If count >= limit: Reject request with 429 status

### Example (100 req/min window)

```
Time: 12:00:00
Requests: [12:00:00]
Count: 1
Remaining: 99

Time: 12:00:30
Requests: [11:59:35, 12:00:00, 12:00:10, 12:00:15, 12:00:30]
Old request at 11:59:35 is filtered out (outside 60s window)
Count: 4
Remaining: 96
```

## KV Namespace Setup

### Development

```bash
# Create KV namespace for development
wrangler kv:namespace create "RATE_LIMIT_KV"

# Copy the ID and update wrangler.toml:
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id"  # Replace with actual ID
```

### Production

```bash
# Create KV namespace for production
wrangler kv:namespace create "RATE_LIMIT_KV" --env production

# Update wrangler.toml under [env.production]:
[[env.production.kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-production-kv-namespace-id"
```

## Error Handling

### KV Store Errors

If KV operations fail, the rate limiter gracefully degrades:

- Requests are **allowed** (fail-open)
- Rate limit headers still present with default values
- Error logged for investigation

This ensures system availability even during KV outages.

### Invalid JWT Tokens

If JWT parsing fails:

- Falls back to IP-based rate limiting
- Continues processing request normally
- No special error handling needed

## Monitoring

### Logs

Rate limit violations are logged:

```
[2026-01-21T12:00:00.000Z] [WARN] Rate limit exceeded for 192.168.1.1 {
  path: '/api/auth/login',
  method: 'POST',
  limit: 5
}
```

### Monitoring Metrics

Key metrics to monitor:
- Rate of 429 responses
- Top rate-limited IP addresses
- Rate limit distribution by endpoint
- KV store performance

## Client Implementation

### Handling Rate Limits

Frontend clients should:

1. **Check headers**: Monitor `X-RateLimit-Remaining`
2. **Back off**: When limit approaching, slow down requests
3. **Respect Retry-After**: Wait suggested seconds on 429 response
4. **Exponential backoff**: Implement retry with increasing delays

Example:

```typescript
async function makeRequest(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeRequest(url, options); // Retry
  }

  return response;
}
```

## Testing

Comprehensive test coverage in `__tests__/worker/rateLimiting.test.ts`:

- Rate limit configuration selection
- Header setting functionality
- Sliding window calculations
- Boundary conditions
- Error handling scenarios

Run tests:

```bash
npm test -- __tests__/worker/rateLimiting.test.ts
```

## Security Considerations

### OWASP Top 10 Coverage

Rate limiting helps address:

1. **Broken Access Control**: Prevents brute force attacks
2. **Security Misconfiguration**: Limits DoS vulnerability surface
3. **Insufficient Logging & Monitoring**: Rate limit violations logged

### Best Practices Implemented

1. **Distributed Tracking**: Cloudflare KV provides edge-local storage
2. **Per-User Limits**: JWT-based tracking prevents shared IP abuse
3. **Fail-Open**: System remains available during KV failures
4. **Sliding Window**: More accurate than fixed window
5. **Configurable**: Easy to adjust limits per endpoint type

## Performance Impact

- **KV Read**: ~5-10ms per request (cached at edge)
- **KV Write**: ~5-10ms per request
- **Memory**: Minimal (stores only timestamps)
- **Overhead**: Negligible compared to database operations

## Troubleshooting

### Common Issues

1. **Frequent Rate Limiting**:
   - Check if same IP/user making excessive requests
   - Verify client-side request batching
   - Consider increasing limits for valid use cases

2. **Rate Limits Not Enforced**:
   - Verify KV namespace is configured
   - Check worker logs for KV errors
   - Ensure `RATE_LIMIT_KV` binding exists

3. **Inaccurate Counts**:
   - Check KV TTL expiration
   - Verify timestamp accuracy
   - Review sliding window logic

### Debug Commands

```bash
# List all rate limit keys
wrangler kv:key list --namespace-id=your-kv-id --prefix="rate_limit"

# View rate limit for specific user
wrangler kv:key get "rate_limit:user123" --namespace-id=your-kv-id

# Delete rate limit for specific user (for testing)
wrangler kv:key delete "rate_limit:user123" --namespace-id=your-kv-id
```

## Future Enhancements

### Potential Improvements

1. **Dynamic Limits**: Adjust based on system load
2. **User Tiers**: Different limits for user roles
3. **Burst Allowance**: Allow short bursts before strict limiting
4. **GraphQL Cost-Based**: Limit based on query complexity
5. **Admin Override**: Whitelist admin IPs/users

### Scaling Considerations

- **Edge Caching**: KV automatically scales with Cloudflare
- **Sharding**: Can add more KV namespaces if needed
- **Dedicated Limits**: Separate KV for high-traffic endpoints

## References

- Cloudflare Workers KV: https://developers.cloudflare.com/workers/runtime-apis/kv/
- HTTP 429 Status: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
- Rate Limiting Best Practices: https://cloud.google.com/architecture/rate-limiting-strategies-techniques
