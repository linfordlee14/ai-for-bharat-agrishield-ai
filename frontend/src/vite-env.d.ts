/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REGION: string
  readonly VITE_MAP_DEFAULT_LAT: string
  readonly VITE_MAP_DEFAULT_LNG: string
  readonly VITE_MAP_DEFAULT_ZOOM: string
  readonly VITE_MAP_DEFAULT_CENTER_LAT: string
  readonly VITE_MAP_DEFAULT_CENTER_LNG: string
  readonly VITE_MAP_TILE_URL: string
  readonly VITE_ENABLE_MOVEMENT_TRACKING: string
  readonly VITE_ENABLE_AUDIO_DETECTION: string
  readonly VITE_ENABLE_DIAGNOSTICS: string
  readonly VITE_INCIDENTS_REFRESH_INTERVAL: string
  readonly VITE_DEVICES_REFRESH_INTERVAL: string
  readonly VITE_TELEMETRY_REFRESH_INTERVAL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
