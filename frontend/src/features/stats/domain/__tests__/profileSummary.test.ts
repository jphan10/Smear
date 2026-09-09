import { describe, expect, it } from "vitest"
import { calculateWeeklyStreak, selectProfileSummary } from "../profile/selectProfileSummary"
import { climb } from "./fixtures"

const NOW = new Date("2026-04-15T12:00:00.000Z") // Wednesday

describe("calculateWeeklyStreak", () => {
  it("returns zeros without climbs", () => {
    expect(calculateWeeklyStreak([], NOW)).toEqual({ currentWeeks: 0, bestWeeks: 0 })
  })

  it("counts consecutive weeks ending in the current week", () => {
    const streak = calculateWeeklyStreak(
      [
        climb({ id: "a", loggedAt: "2026-04-01T10:00:00.000Z" }),
        climb({ id: "b", loggedAt: "2026-04-08T10:00:00.000Z" }),
        climb({ id: "c", loggedAt: "2026-04-14T10:00:00.000Z" }),
      ],
      NOW,
    )

    expect(streak).toEqual({ currentWeeks: 3, bestWeeks: 3 })
  })

  it("keeps the streak alive through last week but breaks after a missed week", () => {
    const lastWeek = calculateWeeklyStreak([climb({ id: "a", loggedAt: "2026-04-07T10:00:00.000Z" })], NOW)
    expect(lastWeek.currentWeeks).toBe(1)

    const stale = calculateWeeklyStreak([climb({ id: "a", loggedAt: "2026-03-20T10:00:00.000Z" })], NOW)
    expect(stale).toEqual({ currentWeeks: 0, bestWeeks: 1 })
  })

  it("remembers the best run even when the current run is shorter", () => {
    const streak = calculateWeeklyStreak(
      [
        climb({ id: "a", loggedAt: "2026-01-05T10:00:00.000Z" }),
        climb({ id: "b", loggedAt: "2026-01-12T10:00:00.000Z" }),
        climb({ id: "c", loggedAt: "2026-01-19T10:00:00.000Z" }),
        climb({ id: "d", loggedAt: "2026-04-14T10:00:00.000Z" }),
      ],
      NOW,
    )

    expect(streak).toEqual({ currentWeeks: 1, bestWeeks: 3 })
  })
})

describe("selectProfileSummary", () => {
  it("summarizes an empty logbook without a hardest send", () => {
    expect(selectProfileSummary([], { now: NOW })).toEqual({
      totalClimbs: 0,
      gymsVisited: 0,
      streak: { currentWeeks: 0, bestWeeks: 0 },
      hardestSend: null,
      hardestFlashLabel: null,
    })
  })

  it("picks the hardest sent climb and hardest flash separately", () => {
    const summary = selectProfileSummary(
      [
        climb({ id: "a", outcome: "send", gradeIndex: 7, gradeLabel: "V7", gymName: "Sender One", color: "red" }),
        climb({ id: "b", outcome: "flash", gradeIndex: 5, gradeLabel: "V5" }),
        climb({ id: "c", outcome: "attempt", gradeIndex: 9, gradeLabel: "V9", gymId: "gym-2" }),
      ],
      { now: NOW },
    )

    expect(summary.totalClimbs).toBe(3)
    expect(summary.gymsVisited).toBe(2)
    expect(summary.hardestSend?.gradeLabel).toBe("V7")
    expect(summary.hardestSend?.gymName).toBe("Sender One")
    expect(summary.hardestSend?.isFlash).toBe(false)
    expect(summary.hardestFlashLabel).toBe("V5")
  })
})
