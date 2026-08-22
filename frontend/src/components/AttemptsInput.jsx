import { useState } from "react"

const SLIDER_MIN = 2
const SLIDER_MAX = 10
const MANUAL_MAX = 99

function AttemptsInput({ value, onChange }) {
  const [isManual, setIsManual] = useState(value != null && value > SLIDER_MAX)
  const sliderValue = value ?? SLIDER_MIN

  return (
    <div
      className="mt-2 flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
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
          className="app-native-text-entry w-16 rounded-full border border-stone-border bg-stone-surface px-3 py-1 text-xs text-stone-text outline-none focus:border-ember/30"
        />
      ) : (
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          value={sliderValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1 flex-1 accent-ember"
        />
      )}

      <span className="w-5 text-right text-xs font-semibold text-stone-secondary">
        {value ?? SLIDER_MIN}
      </span>

      <button
        type="button"
        onClick={() => setIsManual((prev) => !prev)}
        className="text-xs font-medium text-stone-muted underline-offset-2 hover:underline"
      >
        {isManual ? "Slider" : "Type"}
      </button>
    </div>
  )
}

export default AttemptsInput
