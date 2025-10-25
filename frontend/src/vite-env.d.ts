/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALGOD_TOKEN: string;
  readonly VITE_ALGOD_ADDRESS: string;
  readonly VITE_ALGOD_PORT: string;
  readonly VITE_INDEXER_TOKEN: string;
  readonly VITE_INDEXER_ADDRESS: string;
  readonly VITE_INDEXER_PORT: string;
  readonly VITE_PERAWALLET_CHAIN_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}