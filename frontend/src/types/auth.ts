/** 對應後端 ReturnMsg 包裝 */
export interface ApiEnvelope<T> {
  CODE: string
  MESSAGE: string
  SUCCESS: boolean
  DATA: T
}

/** POST /api/v1/auth/login 請求 */
export interface LoginRequest {
  USERNAME: string
  PASSWORD: string
}

/** POST /api/v1/auth/login 回應 DATA */
export interface LoginResponseData {
  ACCESS_TOKEN: string
  TOKEN_TYPE: string
  EXPIRES_IN: number
  USERNAME: string
  DISPLAY_NAME: string
  ROLES: string[]
}

/** GET /api/v1/auth/me 回應 DATA */
export interface CurrentUser {
  USERNAME: string
  DISPLAY_NAME: string
  ROLES: string[]
}

export interface LoginFormValues {
  username: string
  password: string
}

export interface LoginSubmitResult {
  success: boolean
  message: string
}