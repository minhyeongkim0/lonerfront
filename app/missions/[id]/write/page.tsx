"use client"

import { type ChangeEvent, type FormEvent, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/auth-client"

type SelectedImage = {
  file: File
  previewUrl: string
}

type UploadImagesResponse = {
  paths: string[]
}

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function WritePostPage() {
  const router = useRouter()
  const params = useParams()
  const missionId = String(params.id)

  const [content, setContent] = useState("")
  const [images, setImages] = useState<SelectedImage[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const onClickAddImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) {
      return
    }

    setErrorMessage("")

    if (images.length + selected.length > MAX_FILES) {
      setErrorMessage("이미지는 최대 3장까지 업로드할 수 있습니다.")
      e.target.value = ""
      return
    }

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("이미지 파일만 선택할 수 있습니다.")
        e.target.value = ""
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("파일 크기는 5MB 이하여야 합니다.")
        e.target.value = ""
        return
      }
    }

    setImages((prev) => [
      ...prev,
      ...selected.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])

    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index]
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadImages = async (accessToken: string): Promise<string[]> => {
    const formData = new FormData()
    images.forEach((img) => formData.append("files", img.file))

    const response = await fetch(`${API_BASE_URL}/api/uploads/post-images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "이미지 업로드에 실패했습니다.")
    }

    const data = (await response.json()) as UploadImagesResponse
    return data.paths
  }

  const submitPost = async (accessToken: string, imagePaths: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/missions/${missionId}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        content: content.trim(),
        imagePaths,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "게시글 등록에 실패했습니다.")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!content.trim()) {
      setErrorMessage("내용을 입력해주세요.")
      return
    }
    if (images.length === 0) {
      setErrorMessage("이미지를 최소 1장 선택해주세요.")
      return
    }

    const accessToken = localStorage.getItem("accessToken") ?? ""
    if (!accessToken) {
      setErrorMessage("로그인이 필요합니다.")
      return
    }

    try {
      setIsSubmitting(true)
      const imagePaths = await uploadImages(accessToken)
      await submitPost(accessToken, imagePaths)
      router.push(`/missions/${missionId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "등록 중 오류가 발생했습니다."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{"미션 인증하기"}</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-10">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{"내용"}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 미션을 완료했어요! 어떤 경험이었나요?"
            rows={5}
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">
            {"사진 첨부"} {"(최대 3장, 장당 5MB)"}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl bg-muted overflow-hidden">
                <img src={img.previewUrl} alt={`선택 이미지 ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80"
                  aria-label="사진 삭제"
                >
                  <X className="h-3.5 w-3.5 text-card" />
                </button>
              </div>
            ))}

            {images.length < MAX_FILES && (
              <button
                type="button"
                onClick={onClickAddImage}
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground hover:border-foreground/30 transition-colors"
                aria-label="사진 추가"
              >
                <Plus className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-foreground">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
        >
          {isSubmitting ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  )
}
