import { useCallback, useEffect, useMemo, useState } from "react"
import { FiMapPin, FiSettings } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { useGym } from "../context/GymContext"
import { fetchReferralCode } from "../lib/auth"
import { fetchUserProfile } from "../lib/profile"
import type { UserProfile } from "../lib/profile"
import BottomNav from "../components/BottomNav"
import ProfileModal from "../components/ProfileModal"
import ProfileSettingsSheet from "../components/ProfileSettingsSheet"
import {
  HardestSendCard,
  ProfileArchetypeCard,
  ProfileAvatar,
  ProfileEmptyState,
  ProfileStatTile,
} from "../components/profile/ProfileCards"
import { selectStatsOverviewViewModel } from "../features/stats/domain/overview/selectStatsOverviewViewModel"
import { selectProfileSummary } from "../features/stats/domain/profile/selectProfileSummary"
import { useSharedStatsBase } from "../features/stats/hooks/useSharedStatsBase"

export default function ProfilePage() {
  const { user } = useAuth()
  const { activeGym } = useGym()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  const { enrichedClimbs, status } = useSharedStatsBase()
  const overview = useMemo(() => selectStatsOverviewViewModel(enrichedClimbs), [enrichedClimbs])
  const summary = useMemo(() => selectProfileSummary(enrichedClimbs), [enrichedClimbs])

  const loadProfile = useCallback(() => {
    if (!user) return
    fetchReferralCode(user.id).then(setReferralCode).catch(console.error)
    fetchUserProfile(user.id).then(setProfile).catch(console.error)
  }, [user])

  useEffect(loadProfile, [loadProfile])

  const displayName = profile?.display_name || profile?.username || "Climber"
  const archetypeVisual = overview.visuals.archetype
  const isStatsLoading = status === "loading" && enrichedClimbs.length === 0

  return (
    <div className="app-safe-shell min-h-screen bg-stone-bg">
      <main className="app-safe-shell__main mx-auto min-h-screen max-w-[420px] px-5 pb-32 pt-6">
        {/* Identity header */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <ProfileAvatar avatarUrl={profile?.avatar_url ?? null} displayName={displayName} />
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-extrabold tracking-[-0.02em] text-stone-text">{displayName}</h1>
              {profile?.username && (
                <p className="mt-0.5 truncate text-[13px] text-stone-secondary">@{profile.username}</p>
              )}
              {activeGym && (
                <p className="mt-[5px] flex items-center gap-[5px] text-xs text-stone-secondary">
                  <FiMapPin className="h-[13px] w-[13px] shrink-0 text-ember" />
                  <span className="truncate">{activeGym.name}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="-m-[3px] shrink-0 p-[3px]"
          >
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-stone-border bg-stone-surface text-stone-secondary transition-colors hover:bg-stone-alt hover:text-stone-text">
              <FiSettings className="h-[17px] w-[17px]" />
            </span>
          </button>
        </header>

        {isStatsLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ember border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mt-3">
              {summary.hardestSend ? (
                <HardestSendCard
                  gradeLabel={summary.hardestSend.gradeLabel}
                  colorLabel={summary.hardestSend.colorLabel}
                  gymName={summary.hardestSend.gymName}
                  loggedAt={summary.hardestSend.loggedAt}
                  hardestFlashLabel={summary.hardestFlashLabel}
                  styleTag={summary.hardestSend.styleTag}
                />
              ) : (
                <ProfileEmptyState
                  title="No sends yet"
                  body="Log a climb and your hardest send shows up here."
                />
              )}
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              <ProfileStatTile label="Climbs" value={`${summary.totalClimbs}`} sub="logged all time" />
              <ProfileStatTile
                label="Streak"
                value={`${summary.streak.currentWeeks} wk`}
                sub={`best ${summary.streak.bestWeeks} wk`}
                highlight={summary.streak.currentWeeks > 0}
              />
              <ProfileStatTile label="Gyms" value={`${summary.gymsVisited}`} sub="visited" />
            </div>

            {archetypeVisual.kind === "radar" && archetypeVisual.state !== "empty" && (
              <div className="mt-2.5">
                <ProfileArchetypeCard
                  descriptor={overview.tiles.archetype.descriptor}
                  secondaryText={overview.tiles.archetype.secondaryText}
                  axes={archetypeVisual.axes}
                />
              </div>
            )}
          </>
        )}

        <ProfileSettingsSheet
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onEditProfile={() => {
            setIsSettingsOpen(false)
            setIsEditProfileOpen(true)
          }}
          referralCode={referralCode}
        />

        <ProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          startInEditMode
          onSave={() => {
            setIsEditProfileOpen(false)
            loadProfile()
          }}
        />
      </main>
      <BottomNav />
    </div>
  )
}
