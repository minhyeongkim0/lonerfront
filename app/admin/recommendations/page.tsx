"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type AdminRecommendationItem = {
  id: string
  userId: string
  authorMasked: string
  title: string
  content: string
  upvoteCount: number
  downvoteCount: number
  score: number
  createdAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("ko-KR")
}

export default function AdminRecommendationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<AdminRecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const accessToken = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("accessToken") ?? ""
  }, [])

  const fetchItems = useCallback(async () => {
    if (!accessToken) {
      setErrorMessage("관리자 토큰이 없습니다. 다시 로그인해주세요.")
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage("")
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/recommendations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
        const text = await response.text()
        throw new Error(text || "추천 리스트를 불러오지 못했습니다.")
      }

      setItems((await response.json()) as AdminRecommendationItem[])
    } catch (error) {
      const message = error instanceof Error ? error.message : "추천 리스트를 불러오지 못했습니다."
      setErrorMessage(message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, router])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">추천 리스트</h1>
        <button
          onClick={() => void fetchItems()}
          className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
        >
          새로고침
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">작성자</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">제목</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">추천</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">비추천</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">점수</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  추천 글이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{item.authorMasked}</td>
                  <td className="px-4 py-3 text-foreground">
                    <p className="font-semibold">{item.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{item.content}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{item.upvoteCount}</td>
                  <td className="px-4 py-3 text-foreground">{item.downvoteCount}</td>
                  <td className="px-4 py-3 text-foreground">{item.score}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
