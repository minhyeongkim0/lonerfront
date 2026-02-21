"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/auth-client"

type AdminRefundItem = {
  refundId: string
  userId: string
  authorMasked: string
  amount: number
  bankName: string
  accountNumber: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

type ProcessRefundResponse = {
  refundId: string
  status: "approved" | "rejected"
  restoredPoint: number
  userPoint: number
  processedAt: string
  rejectedReason: string | null
}

function formatDate(value: string): string {
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

export default function AdminRefundsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<AdminRefundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const accessToken = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("accessToken") ?? ""
  }, [])

  const fetchPendingRefunds = useCallback(async () => {
    if (!accessToken) {
      setError("관리자 토큰이 없습니다. 먼저 로그인해주세요.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/refunds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userId")
        localStorage.removeItem("username")
        router.push("/login")
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.")
      }

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(await response.text()))
      }

      setRequests((await response.json()) as AdminRefundItem[])
    } catch (e) {
      const message = e instanceof Error ? e.message : "환급 신청 목록을 불러오지 못했습니다."
      setError(message)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, router])

  useEffect(() => {
    void fetchPendingRefunds()
  }, [fetchPendingRefunds])

  const processRefund = async (refundId: string, action: "approve" | "reject") => {
    if (!accessToken) {
      setError("관리자 토큰이 없습니다. 먼저 로그인해주세요.")
      return
    }

    setProcessingId(refundId)
    setError(null)
    setActionMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/refunds/${refundId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: action === "reject" ? JSON.stringify({ reason: "관리자 반려" }) : undefined,
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userId")
        localStorage.removeItem("username")
        router.push("/login")
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.")
      }

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(await response.text()))
      }

      const result = (await response.json()) as ProcessRefundResponse
      setRequests((prev) => prev.filter((item) => item.refundId !== refundId))
      if (action === "approve") {
        setActionMessage(`환급 승인 완료 (${result.refundId})`)
      } else {
        setActionMessage(`환급 반려 완료 (+${result.restoredPoint.toLocaleString()}p 복구)`)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "환급 처리에 실패했습니다."
      setError(message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{"환급 처리"}</h1>
        <button
          onClick={() => void fetchPendingRefunds()}
          className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
        >
          {"새로고침"}
        </button>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-xl bg-primary/20 px-4 py-3 text-sm font-medium text-foreground">{actionMessage}</div>
      )}

      {error && <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">{error}</div>}

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"사용자"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"신청금액"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"은행"}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground md:table-cell">{"계좌번호"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"신청일"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"액션"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {"불러오는 중..."}
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {"대기 중인 환급 신청이 없습니다."}
                </td>
              </tr>
            ) : (
              requests.map((req, i) => (
                <tr key={req.refundId} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{req.authorMasked}</td>
                  <td className="px-4 py-3 text-foreground">{req.amount.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-foreground">{req.bankName}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{req.accountNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void processRefund(req.refundId, "approve")}
                        disabled={processingId === req.refundId}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {processingId === req.refundId ? "처리중..." : "승인"}
                      </button>
                      <button
                        onClick={() => void processRefund(req.refundId, "reject")}
                        disabled={processingId === req.refundId}
                        className="rounded-xl bg-destructive/90 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {"반려"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
