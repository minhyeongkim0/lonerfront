"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type AdminPostItem = {
  postId: string
  missionId: string
  missionTitle: string
  userId: string
  authorMasked: string
  content: string
  status: string
  createdAt: string
}

type ApprovePostResponse = {
  postId: string
  userId: string
  grantedPoint: number
  userPoint: number
  status: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("ko-KR")
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [postList, setPostList] = useState<AdminPostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [approvingPostId, setApprovingPostId] = useState<string | null>(null)

  const accessToken = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("accessToken") ?? ""
  }, [])

  const fetchPendingPosts = useCallback(async () => {
    if (!accessToken) {
      setError("관리자 토큰이 없습니다. 먼저 로그인해 accessToken을 저장해주세요.")
      setPostList([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/posts`, {
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
        const text = await response.text()
        throw new Error(text || "관리자 게시글 목록을 불러오지 못했습니다.")
      }

      const data = (await response.json()) as AdminPostItem[]
      setPostList(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "관리자 게시글 목록을 불러오지 못했습니다."
      setError(message)
      setPostList([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, router])

  useEffect(() => {
    void fetchPendingPosts()
  }, [fetchPendingPosts])

  const approvePost = async (postId: string) => {
    if (!accessToken) {
      setError("관리자 토큰이 없습니다. 먼저 로그인해주세요.")
      return
    }

    setApprovingPostId(postId)
    setActionMessage(null)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/approve`, {
        method: "POST",
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
        const text = await response.text()
        throw new Error(text || "승인 처리에 실패했습니다.")
      }

      const result = (await response.json()) as ApprovePostResponse
      setPostList((prev) => prev.filter((item) => item.postId !== postId))
      setActionMessage(`승인 완료: +${result.grantedPoint.toLocaleString()}p 지급`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "승인 처리에 실패했습니다."
      setError(message)
    } finally {
      setApprovingPostId(null)
    }
  }

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{"인증 심사"}</h1>
        <button
          onClick={() => void fetchPendingPosts()}
          className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
        >
          {"새로고침"}
        </button>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-xl bg-primary/20 px-4 py-3 text-sm font-medium text-foreground">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"사용자"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"미션명"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"작성일"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">{"글 미리보기"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"액션"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {"불러오는 중..."}
                </td>
              </tr>
            ) : postList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {"승인 대기 게시글이 없습니다."}
                </td>
              </tr>
            ) : (
              postList.map((post, i) => (
                <tr key={post.postId} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{post.authorMasked}</td>
                  <td className="px-4 py-3 text-foreground">{post.missionTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(post.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    <span className="line-clamp-1">{post.content}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void approvePost(post.postId)}
                      disabled={approvingPostId === post.postId}
                      className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {approvingPostId === post.postId ? "처리중..." : "포인트 지급"}
                    </button>
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
