import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { FiChevronLeft, FiMapPin, FiShare2 } from "react-icons/fi"
import BottomNav from "../components/BottomNav"
import FollowButton from "../components/social/FollowButton"
import {
  HardestSendCard,
  ProfileArchetypeCard,
  ProfileAvatar,
  ProfileEmptyState,
  ProfileStatTile,
} from "../components/profile/ProfileCards"
import { getPublicProfile } from "../lib/api"
import type { PublicProfileObject } from "../lib/api"

type PublicProfileLocationState = { backLabel?: string } | null

type ProfileFetchResult = {
  username: string
  profile: PublicProfileObject | null
  error: string | null
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const backLabel = (location.state as PublicProfileLocationState)?.backLabel ?? "Back"

  const [result, setResult] = useState<ProfileFetchResult | null>(null)
  const [shareLabel, setShareLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    let cancelled = false

    getPublicProfile(username)
      .then((fetched) => {
        if (!cancelled) setResult({ username, profile: fetched, error: null })
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setResult({ username, profile: null, error: "Couldn't load this profile." })
      })

    return () => {
      cancelled = true
    }
  }, [username])

  const isCurrent = result !== null && result.username === username
  const loading = !isCurrent
  const error = isCurrent ? result.error : null
  const profile = isCurrent ? result.profile : null

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: profile?.display_name ?? "Smear profile", url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareLabel("Link copied")
      setTimeout(() => setShareLabel(null), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const displayName = profile?.display_name || profile?.username || "Climber"

  return (
    <div className="app-safe-shell min-h-screen bg-stone-bg">
      <main className="app-safe-shell__main mx-auto min-h-screen max-w-[420px] px-5 pb-32 pt-6">
        <div className="flex h-9 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-1 flex items-center gap-1 rounded-full py-2 pl-1 pr-3 text-sm font-semibold text-stone-secondary hover:text-stone-text"
          >
            <FiChevronLeft className="h-[18px] w-[18px]" />
            {backLabel}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ember border-t-transparent" />
          </div>
        )}

        {!loading && error && <p className="py-12 text-center text-sm text-stone-secondary">{error}</p>}

        {!loading && !error && profile && (
          <>
            <header className="mt-1 flex items-start gap-3.5">
              <ProfileAvatar avatarUrl={profile.avatar_url} displayName={displayName} />
              <div className="min-w-0">
                <h1 className="truncate text-[22px] font-extrabold tracking-[-0.02em] text-stone-text">
                  {displayName}
                </h1>
                {profile.username && (
                  <p className="mt-0.5 truncate text-[13px] text-stone-secondary">@{profile.username}</p>
                )}
                {profile.home_gym_name && (
                  <p className="mt-[5px] flex items-center gap-[5px] text-xs text-stone-secondary">
                    <FiMapPin className="h-[13px] w-[13px] shrink-0 text-ember" />
                    <span className="truncate">{profile.home_gym_name}</span>
                  </p>
                )}
              </div>
            </header>

            <div className="mt-3.5 flex items-center gap-[9px]">
              {!profile.is_self && (
                <FollowButton
                  targetUserId={profile.user_id}
                  initialIsFollowing={profile.is_following}
                  fullWidth
                />
              )}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share profile"
                className={`flex items-center justify-center gap-2 rounded-full border border-stone-border bg-stone-surface px-4 py-[11px] text-sm font-semibold text-stone-secondary hover:bg-stone-alt ${
                  profile.is_self ? "flex-1" : ""
                }`}
              >
                <FiShare2 className="h-[17px] w-[17px]" />
                {shareLabel ?? (profile.is_self ? "Share profile" : "")}
              </button>
            </div>

            <div className="mt-3">
              {profile.hardest_send ? (
                <HardestSendCard
                  gradeLabel={profile.hardest_send.grade_label}
                  colorLabel={profile.hardest_send.color_label}
                  gymName={profile.hardest_send.gym_name}
                  loggedAt={profile.hardest_send.logged_at}
                  hardestFlashLabel={profile.hardest_flash_label}
                  styleTag={profile.hardest_send.style_tag}
                />
              ) : (
                <ProfileEmptyState
                  title="No sends yet"
                  body={`${displayName} hasn't logged a send yet.`}
                />
              )}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <ProfileStatTile label="Climbs" value={`${profile.total_climbs}`} sub="logged all time" />
              <ProfileStatTile label="Followers" value={`${profile.follower_count}`} sub={`${profile.following_count} following`} />
            </div>

            {profile.archetype && profile.archetype.axes.length >= 3 && (
              <div className="mt-2.5">
                <ProfileArchetypeCard
                  descriptor={profile.archetype.descriptor}
                  secondaryText={profile.archetype.secondary_text}
                  axes={profile.archetype.axes}
                />
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
