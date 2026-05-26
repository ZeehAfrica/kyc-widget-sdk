# Installation

## npm (recommended)

```bash
npm i @zeehdev/zeeh-kyc-react-sdk
```

Install peer dependencies if needed:

```bash
npm install react react-dom
```

React **18** or **19** is required.

## Import

```tsx
import { KycWidget } from "@zeehdev/zeeh-kyc-react-sdk";
import "@zeehdev/zeeh-kyc-react-sdk/style.css";
```

The stylesheet is required. Without it, the UI will look unstyled.

## Verify installation

```bash
ls node_modules/@zeehdev/zeeh-kyc-react-sdk/dist/index.js
ls node_modules/@zeehdev/zeeh-kyc-react-sdk/dist/style.css
```

Both files must exist.

---

## Alternative install methods

Use these only for local development or when you cannot use the public package.

### Local path

```bash
cd /path/to/kyc-widget-sdk
npm install && npm run build

cd /path/to/your-app
npm install /path/to/kyc-widget-sdk
```

```json
{
  "dependencies": {
    "@zeehdev/zeeh-kyc-react-sdk": "file:../kyc-widget-sdk"
  }
}
```

### From GitHub

```bash
npm install git+https://github.com/ZeehAfrica/kyc-widget-sdk.git
```

Pin a version:

```bash
npm install git+https://github.com/ZeehAfrica/kyc-widget-sdk.git#main
```

---

## Invalid package names

These commands will **not** work:

| Command | Why |
|---------|-----|
| `npm i @zeeh/kyc-react-sdk` | Wrong scope/name — not published under `@zeeh` |
| `npm i zeeh/kyc-react-sdk` | Invalid syntax (treated as a Git URL) |
| `npm i @zeehafrica/zeeh-kyc-react-sdk` | Old scope — use `@zeehdev` |

Correct name:

```text
@zeehdev/zeeh-kyc-react-sdk
```
