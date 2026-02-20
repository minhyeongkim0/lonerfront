"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { users as initialUsers } from "@/lib/mock-data"
import type { User } from "@/lib/mock-data"

export default function AdminUsersPage() {
  const [userList, setUserList] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")

  const handleBan = () => {
    if (!selectedUser) return
    setUserList(userList.filter((u) => u.id !== selectedUser.id))
    setSelectedUser(null)
    setBanReason("")
  }

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{"사용자 관리"}</h1>

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"아이디"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"가입일"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"보유포인트"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"완료미션수"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"액션"}</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, i) => (
              <tr key={user.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                <td className="px-4 py-3 font-medium text-foreground">{user.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.createdAt}</td>
                <td className="px-4 py-3 text-foreground">{user.points.toLocaleString()}{"p"}</td>
                <td className="px-4 py-3 text-foreground">{user.completedMissions}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="rounded-xl bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
                  >
                    {"강퇴"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{"강퇴 처리"}</h2>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setBanReason("")
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
                aria-label="닫기"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>

            <div className="rounded-xl bg-muted p-3.5 mb-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{selectedUser.username}</span>{" | "}
                {"포인트: "}{selectedUser.points.toLocaleString()}{"p | "}
                {"완료 미션: "}{selectedUser.completedMissions}{"개"}
              </p>
            </div>

            <label className="text-sm font-bold text-foreground mb-2 block">{"강퇴 사유"}</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="강퇴 사유를 입력해주세요"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-3"
            />

            <p className="text-xs text-destructive mb-5 leading-relaxed">
              {"강퇴 시 모든 게시글과 댓글이 삭제되며 해당 계좌로 재가입이 불가능합니다."}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setBanReason("")
                }}
                className="flex-1 rounded-xl bg-muted py-3 text-sm font-medium text-muted-foreground"
              >
                {"취소"}
              </button>
              <button
                onClick={handleBan}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
              >
                {"강퇴 처리"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
