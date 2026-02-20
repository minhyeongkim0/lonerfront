"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, LogOut } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const activeTab =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "recommend"
      ? "recommend"
      : "missions"
  const isHome = pathname === "/"

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-card px-5 py-3 border-b border-border">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">{"혼자라고 생각말기"}</span>
        </Link>
        {isHome && (
          <div className="hidden items-center rounded-xl bg-muted p-1 sm:flex">
            <Link
              href="/?tab=missions"
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                activeTab === "missions" ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              미션수행
            </Link>
            <Link
              href="/?tab=recommend"
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                activeTab === "recommend" ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              미션추천
            </Link>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/mypage"
          className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
        >
          <User className="h-4 w-4" />
          <span>{"마이페이지"}</span>
        </Link>
        <Link
          href="/login"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-label="로그아웃"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  )
}
