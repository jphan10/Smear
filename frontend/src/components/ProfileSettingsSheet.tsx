import { Link } from "react-router-dom"
import type { IconType } from "react-icons"
import { FiMapPin, FiMonitor, FiMoon, FiSun, FiUserPlus } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { useGym } from "../context/GymContext"
import { useTheme } from "../context/ThemeContext"
import { useSheetAnimation } from "../hooks/useSheetAnimation"
// @ts-expect-error - BottomSheet is JSX without type definitions
import BottomSheet from "./BottomSheet"

interface ProfileSettingsSheetProps {
  isOpen: boolean
  onClose: () => void
  onEditProfile: () => void
  referralCode: string | null
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  valueStrong = false,
  onClick,
}: {
  icon: IconType
  label: string
  value: string
  valueStrong?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="flex items-center gap-3">
        <Icon className="h-[18px] w-[18px] shrink-0 text-stone-secondary" />
        <span className="text-[15px] font-semibold text-stone-text">{label}</span>
      </span>
      <span className={`truncate pl-3 text-sm ${valueStrong ? "font-bold text-stone-text" : "text-stone-secondary"}`}>
        {value}
      </span>
    </>
  )

  if (!onClick) {
    return (
      <div className="flex items-center justify-between border-b border-stone-border px-5 py-[15px]">{content}</div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-stone-border px-5 py-[15px] text-left transition-colors hover:bg-stone-alt"
    >
      {content}
    </button>
  )
}

export default function ProfileSettingsSheet({
  isOpen,
  onClose,
  onEditProfile,
  referralCode,
}: ProfileSettingsSheetProps) {
  const { logout, isAdmin } = useAuth()
  const { activeGym } = useGym()
  const { theme, cycleTheme } = useTheme()
  const { isRendered, isVisible } = useSheetAnimation(isOpen)

  if (!isRendered) return null

  const ThemeIcon = theme === "light" ? FiSun : theme === "dark" ? FiMoon : FiMonitor
  const themeLabel = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between border-b border-stone-border px-5 py-3.5">
          <h2 className="text-lg font-bold text-stone-text">Settings</h2>
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-full px-3 py-2 text-sm font-bold text-ember hover:bg-stone-surface"
          >
            Edit profile
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <SettingsRow
            icon={ThemeIcon}
            label="Theme"
            value={themeLabel}
            onClick={cycleTheme}
          />
          <SettingsRow
            icon={FiUserPlus}
            label="Referral code"
            value={referralCode ?? "—"}
            valueStrong={referralCode !== null}
          />
          <SettingsRow icon={FiMapPin} label="Home gym" value={activeGym?.name ?? "Not set"} />

          <div className="px-5">
            {isAdmin && (
              <Link
                to="/admin/duplicates"
                onClick={onClose}
                className="mt-4 block w-full rounded-[28px] border border-stone-border bg-stone-surface px-5 py-4 text-left text-sm font-bold text-stone-muted shadow-[0_14px_34px_rgba(89,68,51,0.08)] dark:border-white/[0.06] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
              >
                Review Duplicate Flags
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full rounded-[28px] border border-stone-border bg-stone-surface px-5 py-4 text-left text-sm font-bold text-ember shadow-[0_14px_34px_rgba(89,68,51,0.08)] dark:border-white/[0.06] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
