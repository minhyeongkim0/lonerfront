"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, FileCheck, Wallet, Users, Home, ThumbsUp } from "lucide-react"

const navItems = [
  { href: "/admin/missions", label: "미션관리", icon: ClipboardList },
  { href: "/admin/posts", label: "인증심사", icon: FileCheck },
  { href: "/admin/recommendations", label: "추천리스트", icon: ThumbsUp },
  { href: "/admin/refunds", label: "환급처리", icon: Wallet },
  { href: "/admin/users", label: "사용자관리", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">{"관리자"}</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-border bg-card md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
