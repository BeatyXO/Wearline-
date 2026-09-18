/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEARLINE_CONTRACT_ADDRESS?: `0x${string}`
  readonly VITE_GENLAYER_NETWORK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ethereum?: unknown
}
