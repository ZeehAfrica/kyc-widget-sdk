# Hosting & CORS

## Hosting your integration

The SDK is a **client-side** library. You host the React application that imports it.

### Typical deployment targets

| Platform | Notes |
|----------|--------|
| **Vercel / Netlify** | `npm run build`, deploy static `dist` or framework output |
| **AWS Amplify** | Same pattern as the Zeeh hosted widget |
| **S3 + CloudFront** | Upload build artifacts; enable HTTPS on CloudFront |
| **Next.js** | Import `style.css` in `app/layout.tsx` or `pages/_app.tsx`; use client component for `KycWidget` |
| **Docker + nginx** | Serve static files; terminate TLS at load balancer |

### HTTPS

Production **must** use HTTPS:

- Browser camera APIs (`getUserMedia`) are restricted on insecure origins  
- Users expect secure onboarding  

Local development may use `http://localhost`; test liveness on HTTPS staging before launch.

### Build output

Your app bundle includes:

- Your React code  
- `@zeehdev/zeeh-kyc-react-sdk` JavaScript (from `node_modules` or bundled)  
- `@zeehdev/zeeh-kyc-react-sdk/style.css` imported in entry  

You do **not** host the SDK repo separately unless you choose a **hosted-only** model (single-purpose verify site).

---

## Hosted-only alternative (no npm in merchant app)

Zeeh or a partner can host:

```text
https://verify.usezeeh.com/{businessId}
```

Merchants link users there or open it in a WebView. This matches the legacy widget model. The npm SDK is for **embedding inside the merchant’s own product**.

---

## CORS

### Why it matters

The SDK runs in the **user’s browser** on **your domain**. API requests go to Zeeh domains. Browsers enforce **Cross-Origin Resource Sharing (CORS)**.

If your origin is not allowlisted, symptoms include:

- UI loads correctly  
- Network tab shows blocked `fetch` / `xhr` to `*.usezeeh.com`  
- Steps fail at email registration, upload, or liveness  

### What to send Zeeh

Provide every origin that will embed the SDK:

| Environment | Example origins |
|-------------|-----------------|
| Local dev | `http://localhost:5173`, `http://localhost:3000` |
| Staging | `https://staging.app.yourcompany.com` |
| Production | `https://app.yourcompany.com` |

Include scheme and host; no trailing path required unless Zeeh specifies otherwise.

### APIs involved

**Main API** (example production base):

```text
https://main-api.usezeeh.com/api/v1
```

Routes used by `KycWidget` include:

- `/kyc-widget/verification`  
- `/kyc-widget/verification/verify-email`  
- `/kyc-widget/verification/liveness-check`  
- `/kyc-widget/verification/verify-nin` (and related verify-* endpoints)  
- `/businesses/{businessId}/name`  

**Services API** (example production origin):

```text
https://api.usezeeh.com
```

Routes include:

- `/v1/upload/image`, `/v1/upload/file`  
- `/v1/liveness-check/liveness-session/{token}/*`  

### Cookies and auth

The SDK uses **Bearer tokens** stored in client state after email verification (`Authorization` header). No special cookie configuration is required for standard embeds.

---

## Environment configuration

### Sandbox (development / UAT)

```tsx
<KycWidget businessId="..." environment="sandbox" />
```

### Production

```tsx
<KycWidget businessId="..." environment="production" />
```

### Custom API bases

Use only when directed by Zeeh:

```tsx
<KycWidget
  businessId="..."
  environment="production"
  mainApiBaseUrl="https://main-api.usezeeh.com/api/v1"
  servicesApiOrigin="https://api.usezeeh.com"
/>
```

---

## Content Security Policy (CSP)

If your site uses CSP headers, you may need to allow:

| Resource | Reason |
|----------|--------|
| `https://*.usezeeh.com` | API calls |
| `https://cdn.jsdelivr.net` | face-api.js model files (liveness) |
| `https://fonts.googleapis.com` | Widget fonts |
| `'unsafe-inline'` or nonces | Only if your CSP blocks injected styles; prefer allowing the SDK stylesheet bundle |

Test liveness in staging after tightening CSP.

---

## Publishing the SDK (for Zeeh maintainers)

To ship updates to merchants:

```bash
npm run build
npm publish --access public   # or private registry
```

Published `files`: `dist/` only (`index.js`, `index.d.ts`, `style.css`).

Merchants pin versions:

```json
"@zeehdev/zeeh-kyc-react-sdk": "^1.2.0"
```

---

## Pre-launch checklist

- [ ] Production URL on HTTPS  
- [ ] CORS allowlisted for all environments  
- [ ] Valid production `businessId`  
- [ ] Smoke test: email OTP → liveness → done on iOS and Android  
- [ ] Error monitoring for `onError` / failed network requests  
