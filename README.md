# @zeeh/kyc-react-sdk

Embeddable React components for **Zeeh** identity verification: full KYC onboarding, face liveness, document upload, and server-side checks—without wiring dozens of API endpoints yourself.

[![npm version](https://img.shields.io/npm/v/@zeeh/kyc-react-sdk)](https://www.npmjs.com/package/@zeeh/kyc-react-sdk)

## Features

- **`<KycWidget />`** — complete KYC flow (email OTP, NIN/BVN, documents, liveness, automated verification)
- **`<IdentityVerification />`** — session-based ID + liveness for merchant links
- **`createZeehClient`** — typed HTTP client with injectable auth
- **Pre-built styles** — import `@zeeh/kyc-react-sdk/style.css`
- **Mobile-ready** — responsive UI; works in mobile browsers and native WebViews

## Requirements

- React **18** or **19**
- **HTTPS** in production (camera / liveness)
- Zeeh **business ID** and **CORS** allowlist for your domain

## Quick start

```bash
npm install @zeeh/kyc-react-sdk
```

```tsx
import { KycWidget } from "@zeeh/kyc-react-sdk";
import "@zeeh/kyc-react-sdk/style.css";

export function VerifyPage() {
  return (
    <KycWidget
      businessId="YOUR_BUSINESS_ID"
      environment="sandbox"
      onComplete={({ sessionId }) => console.log("Done", sessionId)}
    />
  );
}
```

## Documentation

Full public documentation lives in the **[`docs/`](./docs/README.md)** folder:

| Guide | Description |
|-------|-------------|
| [Introduction](./docs/introduction.md) | Overview, architecture, integration patterns |
| [Getting started](./docs/getting-started.md) | Install, styles, first integration |
| [Components](./docs/components.md) | Props, callbacks, step reference |
| [Mobile & native apps](./docs/mobile-integration.md) | WebView, deep links, end-user flow |
| [Hosting & CORS](./docs/hosting-and-cors.md) | Deploy, HTTPS, environments |
| [API client](./docs/api-client.md) | `createZeehClient` reference |
| [Troubleshooting](./docs/troubleshooting.md) | Styling, CORS, camera, verification |

## Exports

```ts
// Components
KycWidget, IdentityVerification, VerificationPage, KycProvider

// Client
createZeehClient, useZeehClient, ZeehClientProvider

// Styles (separate import)
import "@zeeh/kyc-react-sdk/style.css";
```

## Environments

| `environment` | Use case |
|---------------|----------|
| `sandbox` | Development / UAT |
| `production` | Live users |
| `auto` | Infer from hostname (localhost → sandbox) |

## Mobile apps

This is a **web** SDK. Native iOS/Android apps should load a **hosted HTTPS page** that renders `KycWidget` inside a WebView. See [Mobile integration](./docs/mobile-integration.md).

## Development (this repo)

```bash
npm install
npm run dev          # playground at http://localhost:5174
npm run build        # dist/index.js + dist/style.css + types
```

Playground: `http://localhost:5174/?businessId=YOUR_BUSINESS_ID`

## License

Proprietary — use subject to your agreement with Zeeh Africa.

## Support

**support@zeeh.africa** — include business ID, environment, device/browser, and failing step when reporting issues.
