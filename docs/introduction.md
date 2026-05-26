# Introduction

## Overview

The **Zeeh KYC React SDK** (`@zeehafrica/zeeh-kyc-react-sdk`) lets you embed a complete Know Your Customer (KYC) experience inside your own React application. Instead of calling dozens of Zeeh HTTP endpoints yourself, you mount a single component, import one stylesheet, and handle a few callbacks when verification completes or fails.

The SDK includes:

- **Pre-built UI** — email verification, regional flows, NIN/BVN (Nigeria), document upload, utility bill, and face liveness
- **Client-side liveness** — camera capture with on-device face detection before images are sent to Zeeh
- **Typed API client** — optional `createZeehClient` for custom flows or server-driven orchestration
- **Server-side verification** — authoritative checks (NIN, BVN, passport, utility bill, etc.) run on Zeeh APIs after the user finishes the flow

## What the SDK is not

| Expectation | Reality |
|-------------|---------|
| Works without network | Verification requires Zeeh APIs; the SDK orchestrates calls for you |
| React Native native module | This is a **web** SDK; native apps typically use a **WebView** (see [Mobile integration](./mobile-integration.md)) |
| Replaces Zeeh backend setup | You still need a **business ID**, correct **environment**, and **CORS** for your domain |
| Full loan origination UI | Loan widget is not included in v0.1; use the hosted loan widget if needed |

## Supported runtimes

- **React 18 or 19** web applications (Vite, Next.js, CRA, etc.)
- **Mobile browsers** (Safari iOS, Chrome Android) over **HTTPS**
- **In-app WebViews** on iOS and Android loading your hosted React page

## Integration patterns

### 1. Full KYC widget (`KycWidget`)

Best for: onboarding new users to verify identity for your business.

```tsx
<KycWidget
  businessId="YOUR_BUSINESS_ID"
  environment="production"
  onComplete={({ sessionId }) => { /* done */ }}
/>
```

The user moves through: welcome → email → OTP → region → steps overview → basic info → documents → (utility bill for Nigeria) → face liveness → automated verification.

### 2. Identity verification (`IdentityVerification`)

Best for: a **session link** created by your backend (merchant-initiated liveness + ID check).

```tsx
<IdentityVerification
  sessionToken="SESSION_TOKEN_FROM_ZEEH"
  environment="production"
/>
```

The user selects country/ID type (if not pre-filled), enters ID number, completes liveness, and the SDK submits verification to Zeeh.

### 3. Headless / custom UI (`createZeehClient`)

Best for: you build your own UI but want typed methods for Zeeh endpoints.

```ts
const client = createZeehClient({
  environment: "production",
  getAccessToken: () => token,
});
await client.registerUserEmail(email, businessId);
```

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│  Your React app (your domain, HTTPS)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  @zeehafrica/zeeh-kyc-react-sdk                               │  │
│  │  • UI steps + Zustand state                        │  │
│  │  • face-api.js liveness (client)                   │  │
│  │  • createZeehClient → axios                        │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
           ┌───────────────┴───────────────┐
           ▼                               ▼
   Main API                         Services API
   (kyc-widget routes)              (uploads, identity liveness)
```

## Package contents

After `npm install @zeehafrica/zeeh-kyc-react-sdk`:

| Export | Description |
|--------|-------------|
| `@zeehafrica/zeeh-kyc-react-sdk` | Components, hooks, client factory |
| `@zeehafrica/zeeh-kyc-react-sdk/style.css` | Pre-built Tailwind styles (required) |

## Next steps

- [Getting started](./getting-started.md) — install and first screen
- [Components](./components.md) — props, events, step names
- [Mobile integration](./mobile-integration.md) — native apps and end-user flow
