"use client"

import { useState } from "react"
import { refundRequests as initialRequests } from "@/lib/mock-data"

export default function AdminRefundsPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const completeRefund = (id: number) => {
    setRequests(requests.filter((r) => r.id !== id))
    setConfirmId(null)
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{"환급 처리"}</h1>

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"사용자"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"신청금액"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"은행"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">{"계좌번호"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"신청일"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"액션"}</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((req, i) => (
              <tr key={req.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                <td className="px-4 py-3 font-medium text-foreground">{req.userId}</td>
                <td className="px-4 py-3 text-foreground">{req.amount.toLocaleString()}{"원"}</td>
                <td className="px-4 py-3 text-foreground">{req.bank}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{req.accountNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{req.createdAt}</td>
                <td className="px-4 py-3">
                  {confirmId === req.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => completeRefund(req.id)}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        {"확인"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {"취소"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(req.id)}
                      className="rounded-xl bg-foreground px-3 py-1.5 text-xs font-semibold text-card transition-opacity hover:opacity-90"
                    >
                      {"처리 완료"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pendingRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {"대기 중인 환급 신청이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
