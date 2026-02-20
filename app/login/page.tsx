"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"
import { login, saveAuthSession } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!username.trim() || !password) {
      setErrorMessage("아이디와 비밀번호를 입력해주세요.")
      return
    }

    try {
      setIsSubmitting(true)
      const auth = await login({
        username: username.trim(),
        password,
      })
      saveAuthSession(auth)
      if (auth.username === "master") {
        router.push("/admin/posts")
      } else {
        router.push("/")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그인에 실패했습니다."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Home className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {"혼자라고 생각말기"}
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {errorMessage && (
            <div className="rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-foreground">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              {"아이디"}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              {"비밀번호"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"계정이 없으신가요? "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-2">
            {"회원가입"}
          </Link>
        </p>
      </div>
    </div>
  )
}
