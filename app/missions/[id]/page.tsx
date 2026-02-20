"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Star, Heart, MessageCircle } from "lucide-react"
import { API_BASE_URL } from "@/lib/auth-client"

type MissionDetail = {
  id: string
  category: string
  title: string
  description: string
  verifyCondition: string
  rewardPoint: number
  postCount: number
  completed: boolean
}

type MissionPost = {
  id: string
  missionId: string
  authorMasked: string
  content: string
  thumbnail: string | null
  likes: number
  commentCount: number
  status: string
  createdAt: string
}

function PostCard({ post }: { post: MissionPost }) {
  return (
    <Link href={`/missions/${post.missionId}/posts/${post.id}`} className="block">
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{post.authorMasked}</span>
          <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-4 pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MissionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const missionId = String(params.id)
  const [mission, setMission] = useState<MissionDetail | null>(null)
  const [missionPosts, setMissionPosts] = useState<MissionPost[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("")
        const accessToken = localStorage.getItem("accessToken") ?? ""
        let missionRes = await fetch(`${API_BASE_URL}/api/missions/${missionId}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
        const postsRes = await fetch(`${API_BASE_URL}/api/missions/${missionId}/posts`)

        if ((missionRes.status === 401 || missionRes.status === 403) && accessToken) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("userId")
          localStorage.removeItem("username")
          missionRes = await fetch(`${API_BASE_URL}/api/missions/${missionId}`)
        }

        if (!missionRes.ok) {
          const text = await missionRes.text()
          throw new Error(text || "미션 정보를 불러오지 못했습니다.")
        }
        if (!postsRes.ok) {
          const text = await postsRes.text()
          throw new Error(text || "게시글 목록을 불러오지 못했습니다.")
        }

        setMission((await missionRes.json()) as MissionDetail)
        setMissionPosts((await postsRes.json()) as MissionPost[])
      } catch (error) {
        const message = error instanceof Error ? error.message : "미션 정보를 불러오지 못했습니다."
        setErrorMessage(message)
      }
    }

    void fetchData()
  }, [missionId])

  if (!mission) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">{errorMessage || "미션을 불러오는 중입니다."}</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-card" aria-label="뒤로가기">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </header>

      {/* Mission info */}
      <div className="px-5 pb-5">
        <span className="inline-block rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground mb-3">
          {mission.category}
        </span>
        <h1 className="text-2xl font-bold text-foreground mb-2">{mission.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{mission.description}</p>
        <p className="text-xs text-muted-foreground mb-4">{mission.verifyCondition}</p>
        <div className="flex items-center gap-1.5 mb-5">
          <Star className="h-4 w-4 text-primary-foreground fill-primary" />
          <span className="text-lg font-bold text-foreground">{mission.rewardPoint.toLocaleString()}{"p"}</span>
        </div>

        {mission.completed ? (
          <button
            disabled
            className="w-full rounded-xl bg-muted py-4 text-base font-semibold text-muted-foreground"
          >
            {"이미 완료한 미션입니다"}
          </button>
        ) : (
          <Link
            href={`/missions/${missionId}/write`}
            className="block w-full rounded-xl bg-primary py-4 text-center text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {"+ 인증 글 쓰기"}
          </Link>
        )}
      </div>

      {/* Divider */}
      <div className="h-2 bg-background" />

      {/* Posts */}
      <div className="px-5 pt-4">
        <h2 className="text-base font-bold text-foreground mb-4">
          {"다른 사람들의 인증"} {"("}{missionPosts.length}{")"}
        </h2>
        <div className="flex flex-col gap-3">
          {missionPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {missionPosts.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {"아직 인증 글이 없습니다. 첫 번째로 도전해보세요!"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
