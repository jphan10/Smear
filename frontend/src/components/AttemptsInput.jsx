import { useState } from "react"

const SLIDER_MIN = 2
const SLIDER_MAX = 10
const MANUAL_MAX = 99

function AttemptsInput({ value, onChange }) {
  const [isManual, setIsManual] = useState(value != null && value > SLIDER_MAX)
  const sliderValue = value ?? SLIDER_MIN

  return (
    <div className="rounded-[22px] border border-stone-border bg-stone-alt p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-text">Attempts</h3>
        <span className="rounded-full border border-stone-border/80 bg-stone-surface px-3 py-1 text-xs font-semibold text-stone-secondary">
          {value ?? SLIDER_MIN}
        </span>
      </div>

      {isManual ? (
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={MANUAL_MAX}
          value={value ?? ""}
          onChange={(e) => {
            const next = e.target.value === "" ? null : Number(e.target.value)
            onChange(next === null ? null : Math.min(MANUAL_MAX, Math.max(1, next)))
          }}
          className="app-native-text-entry w-full rounded-full border border-stone-border bg-stone-surface px-4 py-2 text-sm text-stone-text outline-none focus:border-ember/30"
        />
      ) : (
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          value={sliderValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-ember"
        />
      )}

      <button
        type="button"
        onClick={() => setIsManual((prev) => !prev)}
        className="mt-2 text-xs font-medium text-stone-muted underline-offset-2 hover:underline"
      >
        {isManual ? "Use slider" : "Enter manually"}
      </button>
    </div>
  )
}

export default AttemptsInput
