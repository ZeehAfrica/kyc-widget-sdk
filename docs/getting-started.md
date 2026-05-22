# Getting started

This guide walks you from zero to a working KYC screen in a React app.

## Prerequisites

- **Node.js** 18+ and npm (or yarn/pnpm)
- A **Zeeh business ID** (from your Zeeh dashboard or account team)
- **React 18 or 19** in your application
- For production: your app hosted on **HTTPS** with **CORS** configured for your origin (see [Hosting & CORS](./hosting-and-cors.md))

## Installation

```bash
npm install @zeeh/kyc-react-sdk
```

Ensure peer dependencies are present:

```bash
npm install react react-dom
```

## Import styles (required)

The SDK ships a compiled CSS bundle. Import it **once** at your app entry point:

```ts
// main.tsx, _app.tsx, or root layout
import "@zeeh/kyc-react-sdk/style.css";
```

If you skip this step, components will render but look unstyled (broken layout, stacked icons, missing cards).

## Minimal integration

```tsx
// src/pages/KycPage.tsx
import { KycWidget } from "@zeeh/kyc-react-sdk";
import "@zeeh/kyc-react-sdk/style.css";

export function KycPage() {
  return (
    <KycWidget
      businessId="YOUR_BUSINESS_ID"
      environment="sandbox"
      onComplete={({ sessionId }) => {
        console.log("KYC complete", sessionId);
        // Navigate user to dashboard, unlock features, etc.
      }}
      onError={(message) => {
        console.error("KYC error", message);
      }}
    />
  );
}
```

Wire the page to a route, for example `/verify` or `/onboarding/kyc`.

## Environment values

| Value | When to use |
|-------|-------------|
| `sandbox` | Development and UAT against Zeeh dev APIs |
| `production` | Live users |
| `auto` | Localhost / URLs containing `sandbox` or `dev` → sandbox; otherwise production |

```tsx
<KycWidget businessId="..." environment="production" />
```

## Sandbox vs production URLs

The SDK resolves API bases automatically:

| Environment | Main API | Services API |
|-------------|----------|--------------|
| Sandbox | `https://dev.main-api.usezeeh.com/api/v1` | `https://staging.api.usezeeh.com` |
| Production | `https://main-api.usezeeh.com/api/v1` | `https://api.usezeeh.com` |

Override only if Zeeh provides custom endpoints:

```tsx
<KycWidget
  businessId="..."
  environment="production"
  mainApiBaseUrl="https://main-api.usezeeh.com/api/v1"
  servicesApiOrigin="https://api.usezeeh.com"
/>
```

## Test locally

1. Use `environment="sandbox"` and a valid sandbox **business ID**.
2. Run your app on `https://localhost` or `http://localhost` (camera may require HTTPS in some browsers).
3. Complete the flow on a **real mobile device** or mobile emulator for liveness.

The SDK repository includes a playground:

```bash
git clone <kyc-widget-sdk-repo>
cd kyc-widget-sdk
npm install
npm run dev
```

Open `http://localhost:5174/?businessId=YOUR_BUSINESS_ID`.

## Handle completion in your app

```tsx
<KycWidget
  businessId="YOUR_BUSINESS_ID"
  environment="production"
  onStepChange={(step) => {
    // Optional analytics: welcome | email | verify | faceLiveness | done | ...
    analytics.track("kyc_step", { step });
  }}
  onComplete={({ sessionId }) => {
    // All UI steps finished AND server verification checks passed
    router.push("/dashboard");
  }}
  onError={(message) => {
    toast.error(message);
  }}
/>
```

`onComplete` fires when automated verification (NIN, BVN, passport, etc.) succeeds. Use `sessionId` if you correlate sessions on your backend.

## Identity-only flow (session token)

If your backend creates a liveness session with Zeeh and returns a token:

```tsx
import { IdentityVerification } from "@zeeh/kyc-react-sdk";
import "@zeeh/kyc-react-sdk/style.css";

export function IdentityPage({ token }: { token: string }) {
  return (
    <IdentityVerification
      sessionToken={token}
      environment="production"
    />
  );
}
```

See [Components](./components.md) for full props.

## Checklist before sharing with users

- [ ] `style.css` imported
- [ ] Valid `businessId`
- [ ] Correct `environment`
- [ ] Production site uses **HTTPS**
- [ ] Zeeh has **allowlisted your origin** for CORS
- [ ] Tested liveness on a physical phone

## Next steps

- [Components reference](./components.md)
- [Mobile & native apps](./mobile-integration.md)
- [Hosting & CORS](./hosting-and-cors.md)
