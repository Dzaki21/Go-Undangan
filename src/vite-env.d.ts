/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INVITATION_DATA?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
