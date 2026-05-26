# Troubleshooting

## UI looks unstyled (“muffled” layout)

**Symptoms:** Plain HTML, stacked icons, no cards, no spacing.

**Cause:** Stylesheet not loaded.

**Fix:**

```ts
import "@zeehdev/zeeh-kyc-react-sdk/style.css";
```

Import at app entry (`main.tsx`, `_app.tsx`, root layout). Restart dev server after adding.

If you consume SDK **source** in a monorepo (not `dist`), ensure Tailwind scans SDK files (`@source` in widget CSS or your Tailwind content config).

---

## API calls fail / network errors

**Symptoms:** UI works; requests to `usezeeh.com` fail in browser console (CORS or 403).

**Fix:**

1. Confirm **CORS** allowlist with Zeeh includes your exact origin (`https://app.example.com`).  
2. Confirm `environment` matches your business (`sandbox` vs `production`).  
3. Confirm `businessId` is valid.  

See [Hosting & CORS](./hosting-and-cors.md).

---

## Invalid business / welcome error

**Symptoms:** “Unable to Proceed” on welcome; business name never loads.

**Fix:**

- Use the correct **business ID** from Zeeh  
- Test with `?businessId=YOUR_ID` in playground  
- Ensure `getBusiness` API succeeds in network tab  

---

## Camera / liveness

**Symptoms:** “Failed to access webcam”, black video, or liveness never completes.

**Fix:**

| Check | Action |
|-------|--------|
| HTTPS | Use HTTPS in production |
| Permission | User must allow camera in browser / WebView |
| WebView | iOS: `NSCameraUsageDescription`; Android: camera permission in manifest |
| Models | Allow `cdn.jsdelivr.net` (face-api models); check CSP |
| Device | Test on real phone; some desktop VMs lack camera |

---

## Liveness uploads but verification fails

**Symptoms:** Snapshot succeeds; `done` step shows failed NIN/BVN/passport.

**Cause:** Server-side data mismatch (wrong NIN/BVN, poor document image, etc.).

**Fix:**

- User must re-enter correct IDs / re-upload documents  
- Check `onError` message and expanded failure details in done step UI  
- Confirm utility bill URL was uploaded (Nigeria) before verify  

---

## Desktop shows QR instead of form

**Expected:** On desktop, welcome may show **Scan to Continue** for better mobile liveness.

**Action:** User scans QR or taps **Continue on Desktop**.

---

## `onComplete` never fires

**Cause:** `onComplete` runs only when **all** automated verification checks pass.

**Fix:**

- Wait for `done` step to finish (not only liveness)  
- If any check fails, use retry in UI or restart flow  
- Use `onStepChange` to see if flow stuck before `done`  

---

## Identity session: “Session not found or expired”

**Fix:**

- Token must be valid and unexpired  
- Use same `environment` as token was created in  
- Regenerate session on backend if expired  

---

## Bundle size

The SDK bundles UI dependencies and face-api integration. Production build may be several MB before gzip.

**Mitigations:**

- Code-split KYC route: `const KycPage = lazy(() => import("./KycPage"))`  
- Load KYC only when user starts verification  

---

## Getting help

Include when contacting support:

1. `businessId` (not secrets)  
2. `environment`  
3. Browser / device (iOS Safari, Android Chrome, WebView)  
4. Screenshot + browser network tab for failed request  
5. Step name from `onStepChange` when issue occurred  

Email: **support@zeeh.africa**
