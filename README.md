# @zeehafrica/zeeh-kyc-react-sdk

Embeddable React components for **Zeeh** identity verification: full KYC onboarding, face liveness, document upload, and server-side checks—without wiring dozens of API endpoints yourself.

## Features

- **`<KycWidget />`** — complete KYC flow (email OTP, NIN/BVN, documents, liveness, automated verification)
- **`<IdentityVerification />`** — session-based ID + liveness for merchant links
- **`createZeehClient`** — typed HTTP client with injectable auth
- **Pre-built styles** — import `@zeehafrica/zeeh-kyc-react-sdk/style.css`
- **Mobile-ready** — responsive UI; works in mobile browsers and native WebViews

## Requirements

- React **18** or **19**
- **HTTPS** in production (camera / liveness)
- Zeeh **business ID** and **CORS** allowlist for your domain

## Installation

> **`npm install @zeeh/kyc-react-sdk` returns 404** — that package is not on [npmjs.com](https://www.npmjs.com).  
> Use the scoped name **`@zeehafrica/zeeh-kyc-react-sdk`** (GitHub Packages or local/git install).

See **[docs/installation.md](./docs/installation.md)** for all options.

### Quick: local path

```bash
cd /path/to/kyc-widget-sdk && npm install && npm run build
cd /path/to/your-app
npm install /path/to/kyc-widget-sdk
```

### Quick: from GitHub

```bash
npm install git+https://github.com/ZeehAfrica/kyc-widget-sdk.git
```

### Quick: GitHub Packages (after publish)

```bash
# ~/.npmrc — use a PAT with read:packages, never commit the token
# @zeehafrica:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=...

npm install @zeehafrica/zeeh-kyc-react-sdk
```

## Quick start

```tsx
import { KycWidget } from "@zeehafrica/zeeh-kyc-react-sdk";
import "@zeehafrica/zeeh-kyc-react-sdk/style.css";

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

| Guide | Description |
|-------|-------------|
| **[Installation](./docs/installation.md)** | Fix 404 / git errors; local, GitHub, Packages |
| [Introduction](./docs/introduction.md) | Overview, architecture, integration patterns |
| [Getting started](./docs/getting-started.md) | Styles, first integration |
| [Components](./docs/components.md) | Props, callbacks, step reference |
| [Mobile & native apps](./docs/mobile-integration.md) | WebView, deep links, end-user flow |
| [Hosting & CORS](./docs/hosting-and-cors.md) | Deploy, HTTPS, environments |
| [API client](./docs/api-client.md) | `createZeehClient` reference |
| [Troubleshooting](./docs/troubleshooting.md) | Styling, CORS, camera, verification |

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

## Publishing (maintainers)

```bash
npm run build
npm publish   # GitHub Packages (@zeehafrica scope)
```

## Support

**support@zeeh.africa** — include business ID, environment, device/browser, and failing step when reporting issues.
