/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIFF_ID?: string;
  readonly VITE_LIFF_ID_RESULTS?: string;
  readonly VITE_LIFF_ID_MANAGE?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_DEV_AUTH?: string;
  /** `true` prints the API URL and error detail on the error screen. */
  readonly VITE_SHOW_ERRORS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
