"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { KOREAN_BANKS } from "@/lib/mock-data"
import { register, saveAuthSession } from "@/lib/auth-client"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [gender, setGender] = useState("")
  const [bank, setBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 80 }, (_, i) => (currentYear - i).toString())
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))

  const genderOptions = [
    { label: "남성", value: "male" },
    { label: "여성", value: "female" },
    { label: "선택안함", value: "none" },
  ] as const

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!username.trim()) {
      setErrorMessage("아이디를 입력해주세요.")
      return
    }
    if (!password) {
      setErrorMessage("비밀번호를 입력해주세요.")
      return
    }
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호 확인이 일치하지 않습니다.")
      return
    }
    if (!birthYear || !birthMonth || !birthDay) {
      setErrorMessage("생년월일을 모두 선택해주세요.")
      return
    }
    if (!gender) {
      setErrorMessage("성별을 선택해주세요.")
      return
    }
    if (!bank) {
      setErrorMessage("은행을 선택해주세요.")
      return
    }
    if (!accountNumber.trim()) {
      setErrorMessage("계좌번호를 입력해주세요.")
      return
    }

    try {
      setIsSubmitting(true)
      const auth = await register({
        username: username.trim(),
        password,
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        birthDay: Number(birthDay),
        gender: gender as "male" | "female" | "none",
        bankName: bank,
        accountNumber: accountNumber.trim(),
      })
      saveAuthSession(auth)
      router.push("/")
    } catch (error) {
      const message = error instanceof Error ? error.message : "회원가입에 실패했습니다."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  const selectClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-card" aria-label="뒤로가기">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{"회원가입"}</h1>
      </header>

      <form onSubmit={handleRegister} className="flex flex-col gap-5 px-5 pb-10">
        {errorMessage && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
            {errorMessage}
          </div>
        )}

        {/* Username */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{"아이디"}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              disabled
              className="shrink-0 rounded-xl bg-secondary px-4 py-3.5 text-sm font-medium text-secondary-foreground"
            >
              {"중복확인"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{"비밀번호"}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className={inputClass}
          />
        </div>

        {/* Password confirm */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{"비밀번호 확인"}</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호 확인"
            className={inputClass}
          />
        </div>

        {/* Date of birth */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{"생년월일"}</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">{"년도"}</span>
              <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className={selectClass}>
                <option value="">{"년도"}</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">{"월"}</span>
              <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className={selectClass}>
                <option value="">{"월"}</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}{"월"}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">{"일"}</span>
              <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className={selectClass}>
                <option value="">{"일"}</option>
                {days.map((d) => (
                  <option key={d} value={d}>{d}{"일"}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{"성별"}</label>
          <div className="flex gap-2">
            {genderOptions.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                  gender === g.value
                    ? "border-foreground bg-foreground text-card"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bank account */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{"출금 계좌"}</label>
          <div className="flex flex-col gap-2">
            <select value={bank} onChange={(e) => setBank(e.target.value)} className={selectClass}>
              <option value="">{"은행 선택"}</option>
              {KOREAN_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="계좌번호 (- 없이 입력)"
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {"이미 계정이 있으신가요? "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
            {"로그인"}
          </Link>
        </p>
      </form>
    </div>
  )
}
