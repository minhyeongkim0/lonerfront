"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Coins } from "lucide-react"
import { API_BASE_URL } from "@/lib/auth-client"

type MeResponse = {
  userId: string
  username: string
  point: number
  bankName: string
  accountNumber: string
}

type RefundRequestItem = {
  refundId: string
  userId: string
  amount: number
  status: "pending" | "approved" | "rejected"
  bankName: string
  accountNumber: string
  createdAt: string
  processedAt: string | null
  rejectedReason: string | null
}

type CreateRefundResponse = {
  refund: RefundRequestItem
  currentPoint: number
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("ko-KR")
}

function parseApiErrorMessage(raw: string): string {
  if (!raw) {
    return "요청 처리 중 오류가 발생했습니다."
  }
  try {
    const json = JSON.parse(raw) as { message?: string }
    if (typeof json.message === "string" && json.message.trim()) {
      return json.message
    }
  } catch {
    return raw
  }
  return raw
}

export default function MyPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [refunds, setRefunds] = useState<RefundRequestItem[]>([])
  const [error, setError] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const accessToken = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("accessToken") ?? ""
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        router.push("/login")
        return
      }

      setLoading(true)
      setError("")

      try {
        const [meResponse, refundResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_BASE_URL}/api/refunds`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ])

        if (meResponse.status === 401 || meResponse.status === 403 || refundResponse.status === 401 || refundResponse.status === 403) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("userId")
          localStorage.removeItem("username")
          router.push("/login")
          return
        }

        if (!meResponse.ok) {
          throw new Error(parseApiErrorMessage(await meResponse.text()))
        }
        if (!refundResponse.ok) {
          throw new Error(parseApiErrorMessage(await refundResponse.text()))
        }

        setMe((await meResponse.json()) as MeResponse)
        setRefunds((await refundResponse.json()) as RefundRequestItem[])
      } catch (e) {
        const message = e instanceof Error ? e.message : "마이페이지 정보를 불러오지 못했습니다."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [accessToken, router])

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!me) {
      return
    }

    setError("")
    setSubmitMessage("")

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("환급 금액은 1원 이상이어야 합니다.")
      return
    }

    if (parsedAmount > me.point) {
      setError("보유 포인트를 초과할 수 없습니다.")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/api/refunds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ amount: parsedAmount }),
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userId")
        localStorage.removeItem("username")
        router.push("/login")
        return
      }

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(await response.text()))
      }

      const result = (await response.json()) as CreateRefundResponse
      setMe((prev) => (prev ? { ...prev, point: result.currentPoint } : prev))
      setRefunds((prev) => [result.refund, ...prev])
      setAmount("")
      setSubmitMessage(`환급 신청 완료: ${parsedAmount.toLocaleString()}원 (포인트 즉시 차감)`)
    } catch (e) {
      const message = e instanceof Error ? e.message : "환급 신청에 실패했습니다."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-card" aria-label="뒤로가기">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{"마이페이지"}</h1>
      </header>

      <div className="flex flex-col gap-6 px-5 pb-10">
        <p className="text-lg text-foreground">
          {"안녕하세요, "}<span className="font-bold">{me?.username ?? "-"}</span>{" 님"}
        </p>

        <div className="flex items-center gap-4 rounded-2xl bg-primary p-5">
          <Coins className="h-8 w-8 text-primary-foreground" />
          <div>
            <p className="text-xs font-medium text-primary-foreground/70">{"보유 포인트"}</p>
            <p className="text-3xl font-bold text-primary-foreground">
              {(me?.point ?? 0).toLocaleString()}p
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">{error}</div>
        )}

        {submitMessage && (
          <div className="rounded-xl bg-primary/20 px-4 py-3 text-sm text-foreground">{submitMessage}</div>
        )}

        <div className="rounded-2xl bg-card p-5">
          <h2 className="mb-4 text-base font-bold text-foreground">{"환급 신청"}</h2>
          <form onSubmit={handleRefund} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">{"환급할 금액"}</label>
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
                {"출금 계좌: "}{me?.bankName ?? "-"}{" "}{me?.accountNumber ?? "-"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{"환급 신청 시 포인트가 즉시 차감됩니다."}</p>
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
            >
              {submitting ? "처리 중..." : "환급 신청하기"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-base font-bold text-foreground">{"신청 내역"}</h2>
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">불러오는 중...</div>
            ) : refunds.length === 0 ? (
              <div className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">신청 내역이 없습니다.</div>
            ) : (
              refunds.map((req) => (
                <div key={req.refundId} className="flex items-center justify-between rounded-2xl bg-card p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{req.amount.toLocaleString()}원</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(req.createdAt)}{" | "}{req.bankName}
                    </span>
                    {req.status === "rejected" && req.rejectedReason && (
                      <span className="text-xs text-destructive">반려 사유: {req.rejectedReason}</span>
                    )}
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      req.status === "pending"
                        ? "bg-secondary text-secondary-foreground"
                        : req.status === "approved"
                          ? "bg-primary/20 text-foreground"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {req.status === "pending" ? "대기중" : req.status === "approved" ? "완료" : "반려"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
