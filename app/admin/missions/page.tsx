"use client"

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type AdminMissionItem = {
  id: string
  category: string
  title: string
  description: string
  verifyCondition: string
  rewardPoint: number
  postCount: number
  active: boolean
  createdAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

export default function AdminMissionsPage() {
  const router = useRouter()
  const [missionList, setMissionList] = useState<AdminMissionItem[]>([])
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("")
  const [points, setPoints] = useState("")
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const accessToken = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("accessToken") ?? ""
  }, [])

  const fetchMissions = useCallback(async () => {
    if (!accessToken) {
      setErrorMessage("관리자 토큰이 없습니다. master 계정으로 로그인 후 다시 시도하세요.")
      setLoading(false)
      setMissionList([])
      return
    }

    setLoading(true)
    setErrorMessage("")
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/missions`, {
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
        throw new Error(text || "미션 목록을 불러오지 못했습니다.")
      }
      setMissionList((await response.json()) as AdminMissionItem[])
    } catch (error) {
      const message = error instanceof Error ? error.message : "미션 목록을 불러오지 못했습니다."
      setErrorMessage(message)
      setMissionList([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, router])

  useEffect(() => {
    void fetchMissions()
  }, [fetchMissions])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setActionMessage("")
    setErrorMessage("")

    if (!category.trim() || !title.trim() || !description.trim() || !condition.trim() || !points.trim()) {
      setErrorMessage("모든 항목을 입력해주세요.")
      return
    }

    if (!accessToken) {
      setErrorMessage("관리자 토큰이 없습니다. 다시 로그인해주세요.")
      return
    }

    const rewardPoint = Number(points)
    if (!Number.isFinite(rewardPoint) || rewardPoint < 1) {
      setErrorMessage("포인트는 1 이상 숫자로 입력해주세요.")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/missions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          category: category.trim(),
          title: title.trim(),
          description: description.trim(),
          verifyCondition: condition.trim(),
          rewardPoint,
        }),
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
        throw new Error(text || "미션 추가에 실패했습니다.")
      }

      await fetchMissions()
      setCategory("")
      setTitle("")
      setDescription("")
      setCondition("")
      setPoints("")
      setActionMessage("미션이 생성되었습니다. 사용자 홈에서 바로 확인할 수 있습니다.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "미션 추가에 실패했습니다."
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{"미션 관리"}</h1>

      {actionMessage && (
        <div className="mb-4 rounded-xl bg-primary/20 px-4 py-3 text-sm font-medium text-foreground">
          {actionMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-8 rounded-2xl bg-card p-5">
        <h2 className="text-base font-bold text-foreground mb-4">{"미션 추가"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리" className={inputClass} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="미션명" className={inputClass} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명" rows={2} className={`${inputClass} resize-none md:col-span-2`} />
          <textarea value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="인증 조건" rows={2} className={`${inputClass} resize-none`} />
          <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="지급 포인트" className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "추가 중..." : "미션 추가"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"ID"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"카테고리"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"미션명"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"포인트"}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{"게시글수"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {"불러오는 중..."}
                </td>
              </tr>
            ) : missionList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {"등록된 미션이 없습니다."}
                </td>
              </tr>
            ) : (
              missionList.map((m, i) => (
                <tr key={m.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                  <td className="px-4 py-3 text-foreground">{m.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{m.category}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{m.title}</td>
                  <td className="px-4 py-3 text-foreground">{m.rewardPoint.toLocaleString()}{"p"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.postCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
