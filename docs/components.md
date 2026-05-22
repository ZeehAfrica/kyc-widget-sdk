# Components

## KycWidget

Renders the full end-user KYC flow for a Zeeh business.

### Import

```tsx
import { KycWidget } from "@zeeh/kyc-react-sdk";
import "@zeeh/kyc-react-sdk/style.css";
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `businessId` | `string` | **required** | Your Zeeh business identifier |
| `environment` | `"production" \| "sandbox" \| "auto"` | `"auto"` | API environment |
| `mainApiBaseUrl` | `string` | — | Override main API base (includes `/api/v1`) |
| `servicesApiOrigin` | `string` | — | Override services API origin (no `/api/v1` suffix) |
| `showModeToggle` | `boolean` | `true` | Show light/dark theme toggle |
| `defaultTheme` | `"dark" \| "light" \| "system"` | `"dark"` | Initial theme |
| `themeStorageKey` | `string` | `"zeeh-kyc-widget-theme"` | `localStorage` key for theme preference |
| `onComplete` | `(payload: { sessionId: string }) => void` | — | Fired when all steps and server checks succeed |
| `onError` | `(message: string) => void` | — | Fired on verification failure messages |
| `onStepChange` | `(step: string) => void` | — | Fired when the active step changes (analytics) |

### Example

```tsx
<KycWidget
  businessId="acme-corp-123"
  environment="production"
  defaultTheme="system"
  onStepChange={(step) => console.log(step)}
  onComplete={({ sessionId }) => {
    fetch("/api/kyc/complete", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }}
  onError={(message) => setError(message)}
/>
```

### Step names (`onStepChange`)

| Step | Description |
|------|-------------|
| `welcome` | Business name loaded; user continues |
| `email` | Email capture |
| `verify` | Email OTP |
| `select-region` | Country / region selection |
| `verification-steps` | Overview of upcoming steps |
| `basicInfo` | Name, phone, country |
| `document` | Passport / ID upload (non-Nigeria path) |
| `utility-bill` | Utility bill upload (Nigeria) |
| `faceLiveness` | Camera liveness check |
| `done` | Server-side verification orchestration |

### User journey (Nigeria)

1. Welcome → Email → OTP → Region → Steps overview  
2. Basic info → NIN/BVN → Utility bill → Face liveness  
3. Done (NIN, BVN, basic info, utility bill verified on server)

### User journey (non-Nigeria)

1. Welcome → Email → OTP → Region → Steps overview  
2. Basic info → Passport upload → Face liveness  
3. Done (passport + basic info verified on server)

### Desktop behavior

On desktop browsers, the **welcome** step may show a **mobile gate**: QR code and link to continue on a phone. Users can choose **Continue on Desktop** to proceed in-browser.

---

## IdentityVerification

Standalone flow for a **pre-created** Zeeh liveness session (merchant link).

### Import

```tsx
import { IdentityVerification } from "@zeeh/kyc-react-sdk";
import "@zeeh/kyc-react-sdk/style.css";
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sessionToken` | `string` | **required** | Token from Zeeh liveness session API |
| `environment` | `"production" \| "sandbox" \| "auto"` | `"auto"` | API environment |
| `mainApiBaseUrl` | `string` | — | Override main API base |
| `servicesApiOrigin` | `string` | — | Override services API origin |
| `defaultTheme` | `"dark" \| "light" \| "system"` | `"dark"` | Initial theme |
| `themeStorageKey` | `string` | `"zeeh-kyc-identity-theme"` | Theme storage key |

### Flow

1. Load session metadata from Zeeh  
2. Select country / ID type (if not pre-filled)  
3. Enter ID number  
4. Liveness (center face → smile → open mouth → capture)  
5. Submit verification to Zeeh  
6. Show success or failure

### Example

```tsx
// Route: /identity-verify/:token
function IdentityRoute() {
  const { token } = useParams();
  if (!token) return <Navigate to="/" />;

  return (
    <IdentityVerification
      sessionToken={token}
      environment="production"
    />
  );
}
```

---

## Advanced: VerificationPage

Lower-level export if you need custom wrappers (same UI as inside `KycWidget`, without providers):

```tsx
import {
  KycProvider,
  VerificationPage,
  WidgetRuntimeConfigProvider,
} from "@zeeh/kyc-react-sdk";
```

You must wrap with `KycProvider` and `WidgetRuntimeConfigProvider` yourself. Most apps should use `KycWidget` instead.

---

## KycProvider

Provides HTTP client context when building custom layouts:

```tsx
import { KycProvider } from "@zeeh/kyc-react-sdk";
import { useKycStore } from "@zeeh/kyc-react-sdk";

<KycProvider
  environment="production"
  getAccessToken={() => useKycStore.getState().token}
>
  {children}
</KycProvider>
```

---

## LoanApplicationWidget

**Not available in v0.1.** Export exists as a placeholder. Use the hosted Zeeh loan widget for loan origination flows until a future SDK release.
