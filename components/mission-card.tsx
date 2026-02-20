"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import type { Mission } from "@/lib/mock-data"

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <Link href={`/missions/${mission.id}`} className="block">
      <div className="relative flex flex-col gap-2.5 rounded-2xl bg-card p-5 transition-shadow hover:shadow-md">
        <span className="self-start rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {mission.category}
        </span>
        <h3 className="text-base font-bold text-foreground leading-snug">{mission.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {mission.points.toLocaleString()}{"p"}
          </span>
          <span className="text-xs text-muted-foreground">
            {mission.postCount}{"개 인증"}
          </span>
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
  )
}
