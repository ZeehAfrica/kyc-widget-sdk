# Mobile & native app integration

The Zeeh KYC React SDK is built for **web**. Mobile users are first-class via responsive UI and camera-based liveness, but the integration model differs between **mobile web** and **native apps**.

## Mobile web (recommended simplest path)

Deploy your React app normally. Users open your site on their phone:

```text
https://app.yourcompany.com/verify
```

Requirements:

- **HTTPS** in production (required for reliable camera access)
- User grants **camera permission** during liveness
- Stable network for uploads and API calls

No extra SDK configuration beyond `KycWidget` and `style.css`.

---

## Native iOS / Android apps

Native apps do **not** import the npm package directly. Use a **WebView** (or in-app browser) that loads your **hosted** React page.

### Architecture

```text
┌──────────────────────┐         ┌─────────────────────────────┐
│  Native app          │  loads  │  Your hosted React app       │
│  (Swift / Kotlin /   │ ──────► │  https://app.you.com/kyc     │
│   React Native)      │ WebView │  <KycWidget businessId=...>  │
└──────────────────────┘         └─────────────────────────────┘
```

### Implementation steps

#### 1. Host a KYC page

Create a route in your web app, e.g. `/kyc`, that renders:

```tsx
<KycWidget
  businessId="YOUR_BUSINESS_ID"
  environment="production"
  onComplete={({ sessionId }) => {
    // Notify native app (see below)
  }}
/>
```

Deploy to HTTPS (Amplify, Vercel, CloudFront, etc.).

#### 2. Open WebView from native code

**iOS (WKWebView)** — load `https://app.yourcompany.com/kyc`.

**Android (WebView)** — same URL.

**React Native (`react-native-webview`)**:

```tsx
<WebView
  source={{ uri: "https://app.yourcompany.com/kyc" }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === "KYC_COMPLETE") {
      navigation.navigate("Home");
    }
  }}
/>
```

#### 3. Bridge completion to native (your responsibility)

The SDK does not include a WebView bridge. In `onComplete`, post a message from the web page:

```tsx
onComplete={({ sessionId }) => {
  const payload = JSON.stringify({ type: "KYC_COMPLETE", sessionId });

  // React Native WebView
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(payload);
    return;
  }

  // Generic: custom URL scheme
  window.location.href = `yourapp://kyc-complete?sessionId=${encodeURIComponent(sessionId)}`;
}}
```

Handle the scheme or `postMessage` in native code, then close the WebView.

#### 4. Deep links (optional)

Open KYC directly:

```text
yourapp://open-kyc
  → native code opens WebView
  → https://app.yourcompany.com/kyc?businessId=...
```

Pass `businessId` as a query param if you read it in your React route.

---

## End-user experience on mobile

What your users should expect:

| Step | User action |
|------|-------------|
| Welcome | Confirm they verify for your business |
| Email | Enter email, receive OTP |
| OTP | Enter 6-digit code |
| Profile | Name, phone, country |
| Nigeria | Enter NIN and BVN |
| Documents | Upload passport or utility bill (region-dependent) |
| Liveness | Allow camera; follow on-screen prompts |
| Done | Wait for automated checks; see success or failure |

### Liveness prompts (full KYC)

- Center face in the oval  
- Hold steady until capture  
- Snapshot uploaded automatically  

### Liveness prompts (identity session)

- Center face → smile → open mouth → capture  

### Tips for support teams

- Use **mobile data or stable Wi‑Fi**  
- Good lighting, face unobstructed  
- If camera fails: check permissions in system settings  
- If desktop link opened first: scan QR or tap **Continue on Desktop**  

---

## React Native

There is **no** `@zeeh/kyc-react-sdk` React Native package in v0.1.

Options:

1. **WebView + hosted page** (recommended)  
2. **Expo WebBrowser** opening the same HTTPS URL  
3. Future: dedicated React Native SDK (not on current roadmap in this package)

---

## PWA / Capacitor / Ionic

Treat as mobile web: wrap your React build in Capacitor WebView. Ensure:

- `android:usesCleartextTraffic` is false in production (HTTPS only)  
- iOS `NSCameraUsageDescription` explains why camera is needed  
- Import `@zeeh/kyc-react-sdk/style.css` in the web bundle  

---

## What to request from Zeeh before mobile launch

1. Production **business ID**  
2. **CORS** allowlist for `https://app.yourcompany.com` (and staging origin)  
3. Sandbox credentials for QA on real devices  
4. Confirmation of **callback URLs** if using identity session links  

---

## Related

- [Getting started](./getting-started.md)  
- [Hosting & CORS](./hosting-and-cors.md)  
- [Troubleshooting — camera issues](./troubleshooting.md#camera--liveness)
