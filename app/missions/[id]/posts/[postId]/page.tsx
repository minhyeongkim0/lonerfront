"use client"

import { type KeyboardEvent, useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Heart, Trash2, Send } from "lucide-react"
import { API_BASE_URL } from "@/lib/auth-client"

type PostDetail = {
  id: string
  missionId: string
  userId: string
  authorMasked: string
  content: string
  images: string[]
  likes: number
  commentCount: number
  status: string
  createdAt: string
}

type CommentItem = {
  id: string
  postId: string
  userId: string
  authorMasked: string
  content: string
  createdAt: string
}

type ToggleLikeResponse = {
  postId: string
  liked: boolean
  likeCount: number
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = String(params.postId)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentList, setCommentList] = useState<CommentItem[]>([])
  const [newComment, setNewComment] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)

  const accessToken = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("accessToken") ?? ""
  }, [])

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("userId") ?? ""
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrorMessage("")
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/posts/${postId}`),
          fetch(`${API_BASE_URL}/api/posts/${postId}/comments`),
        ])

        if (!postRes.ok) {
          const text = await postRes.text()
          throw new Error(text || "게시글을 찾을 수 없습니다.")
        }
        if (!commentsRes.ok) {
          const text = await commentsRes.text()
          throw new Error(text || "댓글을 불러오지 못했습니다.")
        }

        const postData = (await postRes.json()) as PostDetail
        setPost(postData)
        setLikeCount(postData.likes)
        setCommentList((await commentsRes.json()) as CommentItem[])
      } catch (error) {
        const message = error instanceof Error ? error.message : "게시글을 찾을 수 없습니다."
        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [postId])

  const toggleLike = async () => {
    if (!accessToken) {
      setErrorMessage("로그인이 필요합니다.")
      return
    }
    try {
      setErrorMessage("")
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/likes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "좋아요 처리에 실패했습니다.")
      }
      const data = (await response.json()) as ToggleLikeResponse
      setLiked(data.liked)
      setLikeCount(data.likeCount)
    } catch (error) {
      const message = error instanceof Error ? error.message : "좋아요 처리에 실패했습니다."
      setErrorMessage(message)
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) {
      return
    }
    if (!accessToken) {
      setErrorMessage("로그인이 필요합니다.")
      return
    }

    try {
      setSubmittingComment(true)
      setErrorMessage("")
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "댓글 등록에 실패했습니다.")
      }
      const created = (await response.json()) as CommentItem
      setCommentList((prev) => [...prev, created])
      setNewComment("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 등록에 실패했습니다."
      setErrorMessage(message)
    } finally {
      setSubmittingComment(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!accessToken) {
      setErrorMessage("로그인이 필요합니다.")
      return
    }
    try {
      setErrorMessage("")
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "댓글 삭제에 실패했습니다.")
      }
      setCommentList((prev) => prev.filter((c) => c.id !== commentId))
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 삭제에 실패했습니다."
      setErrorMessage(message)
    }
  }

  if (loading || !post) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">{errorMessage || "게시글을 불러오는 중입니다."}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-card" aria-label="뒤로가기">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-5 pb-24">
        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-semibold text-foreground">{post.authorMasked}</span>
          <span className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString("ko-KR")}</span>
        </div>

        {/* Image placeholder area */}
        {post.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {post.images.map((imageUrl, index) => (
              <div key={index} className="aspect-video rounded-2xl bg-muted overflow-hidden">
                <img src={imageUrl} alt={`인증 이미지 ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <p className="text-base text-foreground leading-relaxed mb-6">{post.content}</p>

        {/* Like */}
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 transition-colors"
          aria-label="좋아요"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
          />
          <span className="text-sm font-medium text-foreground">{likeCount}</span>
        </button>

        {/* Comments */}
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-sm font-bold text-foreground mb-4">
            {"댓글"} {commentList.length}{"개"}
          </h3>
          {errorMessage && (
            <div className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-foreground">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {commentList.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{comment.authorMasked}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString("ko-KR")}</span>
                    {comment.userId === currentUserId && (
                      <button onClick={() => deleteComment(comment.id)} className="text-muted-foreground hover:text-destructive" aria-label="댓글 삭제">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment input */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center gap-2 border-t border-border bg-card px-4 py-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void addComment()
            }
          }}
        />
        <button
          onClick={() => void addComment()}
          disabled={submittingComment}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          aria-label="댓글 등록"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
