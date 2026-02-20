"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Coins, ThumbsDown, ThumbsUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { API_BASE_URL } from "@/lib/auth-client"

type MissionItem = {
  id: string
  category: string
  title: string
  rewardPoint: number
  postCount: number
  completed: boolean
}

type RecommendationItem = {
  id: string
  userId: string
  authorMasked: string
  title: string
  content: string
  upvoteCount: number
  downvoteCount: number
  score: number
  myVote: "up" | "down" | null
  createdAt: string
}

export default function MainPage() {
  const router = useRouter()
  const activeTab =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "recommend"
      ? "recommend"
      : "missions"
  const [missions, setMissions] = useState<MissionItem[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [recommendError, setRecommendError] = useState("")
  const [recommendTitle, setRecommendTitle] = useState("")
  const [recommendContent, setRecommendContent] = useState("")
  const [submittingRecommend, setSubmittingRecommend] = useState(false)
  const [redirectingAdmin, setRedirectingAdmin] = useState(false)
  const userPoints = 8000

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const username = localStorage.getItem("username") ?? ""
        if (username === "master") {
          setRedirectingAdmin(true)
          router.replace("/admin/posts")
          return
        }

        const accessToken = localStorage.getItem("accessToken") ?? ""
        let missionResponse = await fetch(`${API_BASE_URL}/api/missions`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        let recommendationResponse = await fetch(`${API_BASE_URL}/api/recommendations`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        if ((missionResponse.status === 401 || missionResponse.status === 403) && accessToken) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("userId")
          localStorage.removeItem("username")
          missionResponse = await fetch(`${API_BASE_URL}/api/missions`)
          recommendationResponse = await fetch(`${API_BASE_URL}/api/recommendations`)
        }

        if (!missionResponse.ok) {
          const text = await missionResponse.text()
          throw new Error(text || "미션 목록을 불러오지 못했습니다.")
        }
        if (!recommendationResponse.ok) {
          const text = await recommendationResponse.text()
          throw new Error(text || "추천 목록을 불러오지 못했습니다.")
        }

        setMissions((await missionResponse.json()) as MissionItem[])
        setRecommendations((await recommendationResponse.json()) as RecommendationItem[])
      } catch (error) {
        const message = error instanceof Error ? error.message : "목록을 불러오지 못했습니다."
        setErrorMessage(message)
      }
    }

    void fetchPageData()
  }, [router])

  if (redirectingAdmin) {
    return null
  }

  const refreshRecommendations = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken") ?? ""
      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "추천 목록을 불러오지 못했습니다.")
      }
      setRecommendations((await response.json()) as RecommendationItem[])
    } catch (error) {
      const message = error instanceof Error ? error.message : "추천 목록을 불러오지 못했습니다."
      setRecommendError(message)
    }
  }

  const createRecommendation = async () => {
    setRecommendError("")
    if (!recommendTitle.trim() || !recommendContent.trim()) {
      setRecommendError("제목과 내용을 입력해주세요.")
      return
    }

    const accessToken = localStorage.getItem("accessToken") ?? ""
    if (!accessToken) {
      setRecommendError("로그인 후 작성할 수 있습니다.")
      return
    }

    try {
      setSubmittingRecommend(true)
      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: recommendTitle.trim(),
          content: recommendContent.trim(),
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "추천 글 등록에 실패했습니다.")
      }

      setRecommendTitle("")
      setRecommendContent("")
      await refreshRecommendations()
    } catch (error) {
      const message = error instanceof Error ? error.message : "추천 글 등록에 실패했습니다."
      setRecommendError(message)
    } finally {
      setSubmittingRecommend(false)
    }
  }

  const voteRecommendation = async (postId: string, voteType: "up" | "down") => {
    setRecommendError("")
    const accessToken = localStorage.getItem("accessToken") ?? ""
    if (!accessToken) {
      setRecommendError("로그인 후 투표할 수 있습니다.")
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ voteType }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "투표에 실패했습니다.")
      }
      await refreshRecommendations()
    } catch (error) {
      const message = error instanceof Error ? error.message : "투표에 실패했습니다."
      setRecommendError(message)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <div className="mx-5 mt-5 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4">
        <Coins className="h-6 w-6 text-primary-foreground" />
        <div>
          <p className="text-xs font-medium text-primary-foreground/70">{"내 포인트"}</p>
          <p className="text-xl font-bold text-primary-foreground">
            {userPoints.toLocaleString()}{"p"}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-5 mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
          {errorMessage}
        </div>
      )}

      <div className="px-5 pb-8">
        {activeTab === "missions" ? (
          <div className="pt-4">
          <div className="grid grid-cols-2 gap-3">
            {missions.map((mission) => (
              <Link key={mission.id} href={`/missions/${mission.id}`} className="block">
                <div className="relative flex flex-col gap-2.5 rounded-2xl bg-card p-5 transition-shadow hover:shadow-md">
                  <span className="self-start rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {mission.category}
                  </span>
                  <h3 className="text-base font-bold text-foreground leading-snug">{mission.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {mission.rewardPoint.toLocaleString()}{"p"}
                    </span>
                    <span className="text-xs text-muted-foreground">{mission.postCount}{"개 인증"}</span>
                  </div>
                  {mission.completed && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-foreground/5">
                      <div className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5">
                        <Check className="h-3.5 w-3.5 text-card" />
                        <span className="text-xs font-semibold text-card">{"완료"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          </div>
        ) : (
          <div className="pt-4">
          <div className="rounded-2xl bg-card p-4">
            <p className="mb-3 text-sm font-bold text-foreground">추천 미션 글쓰기</p>
            <input
              value={recommendTitle}
              onChange={(e) => setRecommendTitle(e.target.value)}
              placeholder="추천 미션 제목"
              className="mb-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={recommendContent}
              onChange={(e) => setRecommendContent(e.target.value)}
              placeholder="추천하고 싶은 미션 내용을 적어주세요"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none"
            />
            <button
              onClick={() => void createRecommendation()}
              disabled={submittingRecommend}
              className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {submittingRecommend ? "등록 중..." : "추천 글 등록"}
            </button>
          </div>

          {recommendError && (
            <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {recommendError}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-2xl bg-card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{item.authorMasked}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("ko-KR")}</p>
                </div>
                <p className="text-base font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => void voteRecommendation(item.id, "up")}
                    disabled={item.myVote !== null}
                    className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs disabled:opacity-50"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    추천 {item.upvoteCount}
                  </button>
                  <button
                    onClick={() => void voteRecommendation(item.id, "down")}
                    disabled={item.myVote !== null}
                    className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs disabled:opacity-50"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    비추천 {item.downvoteCount}
                  </button>
                  <span className="ml-auto text-xs font-semibold text-foreground">점수 {item.score}</span>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="rounded-2xl bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                추천 글이 아직 없습니다.
              </p>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
