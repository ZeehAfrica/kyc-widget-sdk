# @zeeh/kyc-react-sdk

Embeddable React components for Zeeh KYC: full verification flow (`KycWidget`), standalone identity + liveness (`IdentityVerification`), and a typed HTTP client (`createZeehClient`) with injectable auth.

## Install

```bash
npm install @zeeh/kyc-react-sdk
```

Peer dependencies: `react`, `react-dom` (18+ or 19).

## Styles (Tailwind v4)

Import the compiled stylesheet **once** in your app (before or alongside your own global CSS):

```ts
import "@zeeh/kyc-react-sdk/style.css";
```

Alternatively, point your Tailwind v4 `@source` at the package `dist` and rebuild your own bundle (see Tailwind docs for monorepo library scanning).

## Usage

### Full KYC widget

```tsx
import { KycWidget } from "@zeeh/kyc-react-sdk";
import "@zeeh/kyc-react-sdk/style.css";

export function Onboarding() {
  return (
    <KycWidget
      businessId="YOUR_BUSINESS_ID"
      environment="sandbox" // or "production" | "auto"
      onComplete={({ sessionId }) => {
        /* optional */
      }}
      onError={(message) => {
        /* optional */
      }}
    />
  );
}
```

Optional overrides: `mainApiBaseUrl`, `servicesApiOrigin`, `showModeToggle`, `defaultTheme`, `themeStorageKey`.

### Identity + liveness (session link)

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

### Low-level API client

```tsx
import { createZeehClient } from "@zeeh/kyc-react-sdk";

const client = createZeehClient({
  environment: "production",
  getAccessToken: () => localStorage.getItem("kyc_token"),
});

await client.registerUserEmail("user@example.com", businessId);
```

## Playground

From this repo:

```bash
npm install
npm run dev
```

Open http://localhost:5174/?businessId=YOUR_ID (defaults to `your-business-id`).

The playground imports [`playground/src/index.css`](playground/src/index.css), which loads the SDK Tailwind bundle. If the UI looks unstyled after changing components, restart `npm run dev` so Tailwind rescans `src/**` (via `@source` in [`src/styles/widget.css`](src/styles/widget.css)).

## Build

```bash
npm run build:lib
```

Outputs `dist/index.js`, `dist/index.d.ts`, and `dist/style.css`.

## Loan widget

`LoanApplicationWidget` is a placeholder in v0.1. The full loan originator flow remains in the `zeeh-kyc-widget` app under `/l/:uniqueUsername`.

## CORS

Embedded hosts run on their own origins; your Zeeh APIs must allow those origins the same way they allow the standalone widget domain.
