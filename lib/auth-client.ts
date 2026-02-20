export type AuthResponse = {
  userId: string
  username: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

type ApiErrorResponse = {
  code?: string
  message?: string
}

type LoginRequest = {
  username: string
  password: string
}

type RegisterRequest = {
  username: string
  password: string
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: "male" | "female" | "none"
  bankName: string
  accountNumber: string
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

function parseApiErrorMessage(raw: string): string {
  if (!raw) {
    return "요청 처리 중 오류가 발생했습니다."
  }

  try {
    const data = JSON.parse(raw) as ApiErrorResponse
    if (typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message
    }
  } catch {
    return raw
  }

  return raw
}

async function requestAuth(path: string, body: LoginRequest | RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(await response.text()))
  }

  return (await response.json()) as AuthResponse
}

export function login(body: LoginRequest): Promise<AuthResponse> {
  return requestAuth("/api/auth/login", body)
}

export function register(body: RegisterRequest): Promise<AuthResponse> {
  return requestAuth("/api/auth/register", body)
}

export function saveAuthSession(auth: AuthResponse): void {
  localStorage.setItem("accessToken", auth.accessToken)
  localStorage.setItem("refreshToken", auth.refreshToken)
  localStorage.setItem("userId", auth.userId)
  localStorage.setItem("username", auth.username)
}
