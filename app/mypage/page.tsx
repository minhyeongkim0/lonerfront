"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Coins } from "lucide-react"
import { refundRequests } from "@/lib/mock-data"

export default function MyPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const currentUser = {
    username: "user_01",
    points: 8000,
    bank: "국민은행",
    accountNumber: "123-456-7890",
  }

  const handleRefund = (e: React.FormEvent) => {
    e.preventDefault()
    setAmount("")
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-card" aria-label="뒤로가기">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{"마이페이지"}</h1>
      </header>

      <div className="flex flex-col gap-6 px-5 pb-10">
        {/* Greeting */}
        <p className="text-lg text-foreground">
          {"안녕하세요, "}<span className="font-bold">{currentUser.username}</span>{" 님"}
        </p>

        {/* Points card */}
        <div className="flex items-center gap-4 rounded-2xl bg-primary p-5">
          <Coins className="h-8 w-8 text-primary-foreground" />
          <div>
            <p className="text-xs font-medium text-primary-foreground/70">{"보유 포인트"}</p>
            <p className="text-3xl font-bold text-primary-foreground">
              {currentUser.points.toLocaleString()}{"p"}
            </p>
          </div>
        </div>

        {/* Refund form */}
        <div className="rounded-2xl bg-card p-5">
          <h2 className="text-base font-bold text-foreground mb-4">{"환급 신청"}</h2>
          <form onSubmit={handleRefund} className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">{"환급할 금액"}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액을 입력하세요"
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {"출금 계좌: "}{currentUser.bank}{" "}{currentUser.accountNumber}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {"보유 포인트를 초과할 수 없습니다."}
            </p>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
            >
              {"환급 신청하기"}
            </button>
          </form>
        </div>

        {/* Refund history */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">{"신청 내역"}</h2>
          <div className="flex flex-col gap-3">
            {refundRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-2xl bg-card p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {req.amount.toLocaleString()}{"원"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {req.createdAt}{" | "}{req.bank}
                  </span>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    req.status === "pending"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary/20 text-foreground"
                  }`}
                >
                  {req.status === "pending" ? "대기중" : "완료"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
