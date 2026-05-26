# @zeehdev/zeeh-kyc-react-sdk

Embeddable React components for **Zeeh** identity verification: full KYC onboarding, face liveness, document upload, and server-side checks—without wiring dozens of API endpoints yourself.

## Installation

```bash
npm i @zeehdev/zeeh-kyc-react-sdk
```

Peer dependencies (if not already in your app):

```bash
npm install react react-dom
```

## Quick start

Import the stylesheet **once** at your app entry, then mount the widget:

```tsx
import { KycWidget } from "@zeehdev/zeeh-kyc-react-sdk";
import "@zeehdev/zeeh-kyc-react-sdk/style.css";

export function VerifyPage() {
  return (
    <KycWidget
      businessId="YOUR_BUSINESS_ID"
      environment="sandbox"
      onComplete={({ sessionId }) => console.log("Done", sessionId)}
      onError={(message) => console.error(message)}
    />
  );
}
```

## Features

- **`<KycWidget />`** — complete KYC flow (email OTP, NIN/BVN, documents, liveness, automated verification)
- **`<IdentityVerification />`** — session-based ID + liveness for merchant links
- **`createZeehClient`** — typed HTTP client with injectable auth
- **Pre-built styles** — `@zeehdev/zeeh-kyc-react-sdk/style.css`
- **Mobile-ready** — responsive UI; works in mobile browsers and native WebViews

## Requirements

- React **18** or **19**
- **HTTPS** in production (camera / liveness)
- Zeeh **business ID** and **CORS** allowlist for your domain

## Package exports

```ts
import { KycWidget } from "@zeehdev/zeeh-kyc-react-sdk";
import { IdentityVerification } from "@zeehdev/zeeh-kyc-react-sdk";
import { createZeehClient } from "@zeehdev/zeeh-kyc-react-sdk";
import "@zeehdev/zeeh-kyc-react-sdk/style.css";
```

## Environments

| `environment` | Use case |
|---------------|----------|
| `sandbox` | Development / UAT |
| `production` | Live users |
| `auto` | Infer from hostname (localhost → sandbox) |

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting started](./docs/getting-started.md) | First integration, environments, callbacks |
| [Installation](./docs/installation.md) | npm, local path, GitHub alternatives |
| [Introduction](./docs/introduction.md) | Overview, architecture, integration patterns |
| [Components](./docs/components.md) | Props, callbacks, step reference |
| [Mobile & native apps](./docs/mobile-integration.md) | WebView, deep links, end-user flow |
| [Hosting & CORS](./docs/hosting-and-cors.md) | Deploy, HTTPS, CORS |
| [API client](./docs/api-client.md) | `createZeehClient` reference |
| [Troubleshooting](./docs/troubleshooting.md) | Styling, CORS, camera, verification |

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
npm publish --access public
```

## Support

**support@zeeh.africa** — include business ID, environment, device/browser, and failing step when reporting issues.
