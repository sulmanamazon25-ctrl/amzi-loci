/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_A_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
