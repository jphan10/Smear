import { FiZap } from "react-icons/fi"
import type { StatsArchetypePreviewAxis } from "../../features/stats/domain/types"

const CARD_SHADOW =
  "shadow-[0_14px_34px_rgba(89,68,51,0.08)] dark:border-white/[0.06] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]"

export function ProfileAvatar({
  avatarUrl,
  displayName,
  size = 64,
}: {
  avatarUrl: string | null
  displayName: string
  size?: number
}) {
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className="shrink-0 rounded-full object-cover"
        style={{ height: size, width: size }}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-ember-soft font-extrabold text-ember"
      style={{ height: size, width: size, fontSize: Math.round(size * 0.375) }}
    >
      {initials || "?"}
    </div>
  )
}

export type HardestSendCardProps = {
  gradeLabel: string
  colorLabel: string | null
  gymName: string | null
  loggedAt: string | null
  hardestFlashLabel: string | null
  styleTag: string | null
}

function formatSendDate(loggedAt: string | null): string | null {
  if (!loggedAt) return null
  const date = new Date(loggedAt)
  if (!Number.isFinite(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function HardestSendCard({
  gradeLabel,
  colorLabel,
  gymName,
  loggedAt,
  hardestFlashLabel,
  styleTag,
}: HardestSendCardProps) {
  const meta = [gymName, formatSendDate(loggedAt)].filter(Boolean).join(" · ")

  return (
    <section
      aria-label="Hardest send"
      className={`rounded-[30px] border border-ember/20 bg-stone-surface px-4 pb-[13px] pt-3.5 ${CARD_SHADOW}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-muted">Hardest send</p>
          <p className="mt-2 text-[38px] font-extrabold leading-none tracking-[-0.04em] text-ember">{gradeLabel}</p>
          {colorLabel && <p className="mt-1.5 truncate text-[15px] font-bold text-stone-text">{colorLabel}</p>}
          {meta && <p className="truncate text-xs text-stone-secondary">{meta}</p>}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-[7px]">
          {hardestFlashLabel && (
            <span className="flex items-center gap-1 rounded-full border border-ember/35 bg-ember/[0.08] px-2.5 py-px text-[11px] font-bold text-ember">
              <FiZap className="h-3 w-3" />
              Hardest flash {hardestFlashLabel}
            </span>
          )}
          {styleTag && (
            <span className="rounded-full border border-stone-border bg-stone-bg px-2.5 py-px text-[11px] font-semibold capitalize text-stone-secondary dark:bg-stone-alt">
              {styleTag}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export function ProfileStatTile({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <article
      className={`flex min-h-[76px] flex-col justify-between rounded-[20px] border border-stone-border bg-stone-surface px-3 py-2.5 dark:border-white/[0.06]`}
    >
      <p className="text-[11px] font-bold uppercase leading-tight tracking-[0.12em] text-stone-muted">{label}</p>
      <p className={`text-[22px] font-bold leading-none ${highlight ? "text-ember" : "text-stone-text"}`}>{value}</p>
      <p className="text-[11px] leading-tight text-stone-secondary">{sub ?? ""}</p>
    </article>
  )
}

function polarToCartesian(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total

  return {
    x: 50 + Math.cos(angle) * radius,
    y: 40 + Math.sin(angle) * radius,
  }
}

function toPolygonPoints(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(" ")
}

export function ProfileArchetypeRadar({ axes }: { axes: readonly StatsArchetypePreviewAxis[] }) {
  if (axes.length === 0) return null

  const gridPoints = Array.from({ length: axes.length }, (_, index) => polarToCartesian(index, axes.length, 30))
  const valuePoints = axes.map((axis, index) => polarToCartesian(index, axes.length, (axis.value / 100) * 30))

  return (
    <svg aria-hidden="true" viewBox="0 0 100 80" className="h-[83px] w-[104px] shrink-0 overflow-visible">
      <polygon
        points={toPolygonPoints(gridPoints)}
        fill="none"
        stroke="var(--stone-border)"
        strokeOpacity="0.58"
        strokeWidth="1.15"
      />
      <polygon
        points={toPolygonPoints(valuePoints)}
        fill="var(--ember)"
        fillOpacity="0.32"
        stroke="var(--ember)"
        strokeOpacity="0.96"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProfileArchetypeCard({
  descriptor,
  secondaryText,
  axes,
}: {
  descriptor: string
  secondaryText: string
  axes: readonly StatsArchetypePreviewAxis[]
}) {
  return (
    <section
      aria-label="Archetype"
      className={`flex items-center justify-between gap-3 rounded-[30px] border border-ember/20 bg-stone-surface px-4 py-[13px] ${CARD_SHADOW}`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-muted">Archetype</p>
        <h2 className="mt-1 text-[19px] font-extrabold tracking-[-0.02em] text-stone-text">{descriptor}</h2>
        <p className="mt-0.5 text-[13px] text-stone-secondary">{secondaryText}</p>
      </div>
      <ProfileArchetypeRadar axes={axes} />
    </section>
  )
}

export function ProfileEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[30px] border border-dashed border-stone-border/90 bg-stone-bg/60 px-5 py-8 text-center">
      <h2 className="text-base font-bold text-stone-text">{title}</h2>
      <p className="mt-1 text-sm text-stone-secondary">{body}</p>
    </section>
  )
}
