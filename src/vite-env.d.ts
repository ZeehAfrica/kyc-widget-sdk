/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZEEH_SERVICES_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
