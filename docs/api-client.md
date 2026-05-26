# API client

For custom UIs or server-adjacent logic, use **`createZeehClient`** instead of calling REST endpoints manually.

## createZeehClient

```ts
import { createZeehClient } from "@zeehdev/zeeh-kyc-react-sdk";

const client = createZeehClient({
  environment: "production",
  getAccessToken: () => localStorage.getItem("kyc_token"),
});

await client.getBusiness("YOUR_BUSINESS_ID");
```

### Configuration

| Field | Type | Description |
|-------|------|-------------|
| `environment` | `"production" \| "sandbox" \| "auto"` | Resolves default API URLs |
| `mainApiBaseUrl` | `string` (optional) | Full main API base including `/api/v1` |
| `servicesApiOrigin` | `string` (optional) | Services host only (no `/api/v1`) |
| `getAccessToken` | `() => string \| null \| Promise<string \| null>` | Called per request for `Authorization: Bearer` |

The HTTP layer **does not** read global app state. Pass tokens explicitly via `getAccessToken`.

### React context

Inside components wrapped by `KycProvider`:

```tsx
import { useZeehClient } from "@zeehdev/zeeh-kyc-react-sdk";

function MyStep() {
  const client = useZeehClient();
  // client.registerUserEmail(...)
}
```

---

## KYC widget methods

| Method | Description |
|--------|-------------|
| `getBusiness(businessId)` | Fetch business display name |
| `registerUserEmail(email, businessId)` | Start verification |
| `verifyEmail(businessId, email, otpCode)` | Verify email OTP; returns user + token |
| `resendOtp(businessId, email)` | Resend OTP |
| `submitBasicInfo(payload)` | Submit name, phone, country |
| `submitUseNIN_BVN(nin, bvn)` | Submit Nigeria IDs |
| `getLivenessSession()` | Start liveness session |
| `uploadLivenessSnapshot(file, sessionId)` | Upload face snapshot |
| `uploadDocument(file, endpoint)` | Upload passport/ID (`passport`, etc.) |
| `uploadUtilityBillToServicesApi(file)` | Upload utility bill; returns URL |
| `verifyNIN(sessionId)` | Server verify NIN |
| `verifyBVN(sessionId)` | Server verify BVN |
| `verifyBasicInfo(sessionId)` | Server verify basic info |
| `verifyPassport(sessionId)` | Server verify passport |
| `verifyUtilityBill(sessionId, imageUrl)` | Server verify utility bill |
| `getCompleteVerification()` | Final completion check |

---

## Identity liveness methods

| Method | Description |
|--------|-------------|
| `getIdentityLivenessSession(token)` | Load session metadata |
| `startIdentityLiveness(token)` | Start session (if needed) |
| `uploadIdentityLivenessSnapshot(token, file)` | Upload liveness image |
| `submitIdentityVerification(token, payload)` | Submit ID + liveness result |

### IdentitySessionData

Returned by `getIdentityLivenessSession`:

```ts
interface IdentitySessionData {
  countryCode?: string;
  idCode?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  status: string;
  expiresAt: string;
  idCodesByCountry: Record<
    string,
    Array<{ code: string; label: string; hasFaceVerification: boolean }>
  >;
}
```

---

## Liveness utilities (client-side)

Exported for advanced custom UIs:

```ts
import {
  loadFaceApiModels,
  takeMirroredVideoSnapshot,
  isFaceCentered,
  isSmiling,
  isMouthOpen,
  DEFAULT_FACE_API_MODEL_URI,
  useFrameCounter,
} from "@zeehdev/zeeh-kyc-react-sdk";
```

| Export | Purpose |
|--------|---------|
| `loadFaceApiModels(uri?)` | Load TinyFaceDetector + landmarks from CDN |
| `takeMirroredVideoSnapshot(video)` | Capture mirrored JPEG data URL |
| `isFaceCentered` / `isSmiling` / `isMouthOpen` | Landmark geometry helpers |
| `useFrameCounter(target)` | Frame-count challenge helper |

Models default to:

```text
https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model
```

---

## Stores (advanced)

| Export | Use |
|--------|-----|
| `useKycStore` | KYC flow step, token, user, sessionId |
| `useIdentityStore` | Identity session step, idNumber, imageUrl |

Prefer callbacks on `KycWidget` over reading store state in host apps.

---

## Error handling

Methods throw axios errors on failure. Typical pattern:

```ts
try {
  await client.verifyEmail(businessId, email, otp);
} catch (err) {
  const message =
    err?.response?.data?.message ?? "Verification failed";
}
```
