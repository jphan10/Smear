import { filterFlashClimbs, filterSentClimbs } from "../primitives/filters"
import { formatVGrade } from "../primitives/grades"
import type { EnrichedClimb } from "../primitives/types"

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export type ProfileHardestSend = {
  gradeLabel: string
  gymName: string | null
  loggedAt: string
  colorLabel: string | null
  styleTag: string | null
  isFlash: boolean
}

export type ProfileStreak = {
  currentWeeks: number
  bestWeeks: number
}

export type ProfileSummary = {
  totalClimbs: number
  gymsVisited: number
  streak: ProfileStreak
  hardestSend: ProfileHardestSend | null
  hardestFlashLabel: string | null
}

/**
 * Monday-anchored week index. Two climbs in the same calendar week share an index,
 * and consecutive weeks differ by exactly one.
 */
function getWeekIndex(isoDate: string): number | null {
  const timestamp = new Date(isoDate).getTime()

  if (!Number.isFinite(timestamp)) {
    return null
  }

  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  const daysSinceMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysSinceMonday)

  return Math.round(date.getTime() / MS_PER_WEEK)
}

export function calculateWeeklyStreak(climbs: readonly EnrichedClimb[], now: Date = new Date()): ProfileStreak {
  const weekIndexes = new Set<number>()

  for (const climb of climbs) {
    const weekIndex = getWeekIndex(climb.loggedAt)
    if (weekIndex !== null) {
      weekIndexes.add(weekIndex)
    }
  }

  if (weekIndexes.size === 0) {
    return { currentWeeks: 0, bestWeeks: 0 }
  }

  const sortedWeeks = [...weekIndexes].sort((left, right) => left - right)

  let bestWeeks = 1
  let runLength = 1

  for (let index = 1; index < sortedWeeks.length; index += 1) {
    runLength = sortedWeeks[index] === sortedWeeks[index - 1] + 1 ? runLength + 1 : 1
    bestWeeks = Math.max(bestWeeks, runLength)
  }

  // A streak stays alive through the current week; it breaks once a full week is missed.
  const lastLoggedWeek = sortedWeeks[sortedWeeks.length - 1]
  const thisWeek = getWeekIndex(now.toISOString())
  const isLive = thisWeek === null || lastLoggedWeek >= thisWeek - 1

  return { currentWeeks: isLive ? runLength : 0, bestWeeks }
}

function getHardestClimb(climbs: readonly EnrichedClimb[]): EnrichedClimb | null {
  return climbs.reduce<EnrichedClimb | null>((hardest, climb) => {
    if (typeof climb.gradeIndex !== "number" || !Number.isFinite(climb.gradeIndex)) {
      return hardest
    }

    if (hardest === null || climb.gradeIndex > (hardest.gradeIndex ?? Number.NEGATIVE_INFINITY)) {
      return climb
    }

    return hardest
  }, null)
}

function toTitleCase(value: string | null | undefined): string | null {
  if (!value || !value.trim()) {
    return null
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function selectProfileSummary(
  climbs: readonly EnrichedClimb[],
  options: { now?: Date } = {},
): ProfileSummary {
  const sentClimbs = filterSentClimbs(climbs)
  const flashClimbs = filterFlashClimbs(climbs)
  const hardestSent = getHardestClimb(sentClimbs)
  const hardestFlash = getHardestClimb(flashClimbs)

  return {
    totalClimbs: climbs.length,
    gymsVisited: new Set(climbs.flatMap((climb) => (climb.gymId ? [climb.gymId] : []))).size,
    streak: calculateWeeklyStreak(climbs, options.now ?? new Date()),
    hardestSend:
      hardestSent === null
        ? null
        : {
            gradeLabel: hardestSent.gradeLabel ?? formatVGrade(hardestSent.gradeIndex),
            gymName: hardestSent.gymName,
            loggedAt: hardestSent.loggedAt,
            colorLabel: toTitleCase(hardestSent.color),
            styleTag: toTitleCase(hardestSent.tags[0]?.name),
            isFlash: hardestSent.isFlash,
          },
    hardestFlashLabel:
      hardestFlash === null ? null : hardestFlash.gradeLabel ?? formatVGrade(hardestFlash.gradeIndex),
  }
}
