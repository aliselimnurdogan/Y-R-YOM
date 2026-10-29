/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STEP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
