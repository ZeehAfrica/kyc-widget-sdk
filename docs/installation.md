# Installation

## Package name

The published package name is:

```text
@zeehafrica/zeeh-kyc-react-sdk
```

It is **not** on the public npm registry (`registry.npmjs.org`) unless your team publishes it there separately.

`npm install @zeeh/kyc-react-sdk` will return **404** — that name does not exist on npmjs.com.

`npm install zeeh/kyc-react-sdk` is **invalid** — npm treats that as a Git URL and will fail.

---

## Option A — Local path (fastest for development)

Use this while building your app next to the SDK repo.

1. Build the SDK once:

```bash
cd /path/to/kyc-widget-sdk
npm install
npm run build
```

2. In your React app:

```bash
npm install /path/to/kyc-widget-sdk
```

3. Import using the **scoped** name:

```tsx
import { KycWidget } from "@zeehafrica/zeeh-kyc-react-sdk";
import "@zeehafrica/zeeh-kyc-react-sdk/style.css";
```

**`package.json` dependency example:**

```json
{
  "dependencies": {
    "@zeehafrica/zeeh-kyc-react-sdk": "file:../kyc-widget-sdk"
  }
}
```

---

## Option B — Install from GitHub (HTTPS)

Repository: `https://github.com/ZeehAfrica/kyc-widget-sdk`

```bash
npm install git+https://github.com/ZeehAfrica/kyc-widget-sdk.git
```

This clones the repo and runs the `prepare` script to build `dist/`. First install can take a few minutes.

Pin a branch or tag:

```bash
npm install git+https://github.com/ZeehAfrica/kyc-widget-sdk.git#main
```

Use **HTTPS**, not `zeeh/kyc-react-sdk` (that is not valid npm syntax).

---

## Option C — GitHub Packages (team registry)

The SDK is configured to publish to **GitHub Packages** under the `@zeehafrica` scope.

### 1. Publish (maintainers only)

```bash
cd kyc-widget-sdk
npm run build
npm publish
```

Requires a GitHub PAT with `write:packages` and access to the `ZeehAfrica` org.

### 2. Authenticate (every developer machine)

Create a [GitHub personal access token](https://github.com/settings/tokens) with **`read:packages`**.

In your app project (or `~/.npmrc`):

```ini
@zeehafrica:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
```

See [`.npmrc.example`](../.npmrc.example) in this repo. **Never commit tokens to git.**

### 3. Install

```bash
npm install @zeehafrica/zeeh-kyc-react-sdk
```

---

## Option D — Tarball

```bash
cd kyc-widget-sdk
npm run build
npm pack
# Creates zeehafrica-zeeh-kyc-react-sdk-0.1.0.tgz

cd /path/to/your-app
npm install /path/to/kyc-widget-sdk/zeehafrica-zeeh-kyc-react-sdk-0.1.0.tgz
```

---

## Option E — Public npm (future)

To use `npm install @zeeh/kyc-react-sdk` on **npmjs.com**, a maintainer must:

1. Create the `@zeeh` npm organization (or rename the package).
2. Run `npm publish --access public` against `registry.npmjs.org`.
3. Update docs to match the published name.

Until then, use options A–D above.

---

## Peer dependencies

Your app must have:

```bash
npm install react react-dom
```

React **18** or **19**.

---

## Verify installation

```bash
ls node_modules/@zeehafrica/zeeh-kyc-react-sdk/dist/index.js
ls node_modules/@zeehafrica/zeeh-kyc-react-sdk/dist/style.css
```

Both files must exist.

---

## Import checklist

```tsx
import { KycWidget } from "@zeehafrica/zeeh-kyc-react-sdk";
import "@zeehafrica/zeeh-kyc-react-sdk/style.css";
```

Wrong names that will **not** work:

| Command / import | Result |
|------------------|--------|
| `@zeeh/kyc-react-sdk` | 404 on npmjs.org (not published there) |
| `zeeh/kyc-react-sdk` | Invalid git shorthand / permission errors |
| Missing `style.css` | UI renders unstyled |
