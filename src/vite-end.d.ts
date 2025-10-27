/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
  readonly VITE_OLLAMA_BASE_URL?: string
  readonly VITE_OLLAMA_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}