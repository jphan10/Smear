import { useState } from 'react'
import { followUser, unfollowUser } from '../../lib/api'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  onToggle?: (isFollowing: boolean) => void
  /** Stretch to fill its row and use the larger profile-action metrics. */
  fullWidth?: boolean
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  onToggle,
  fullWidth = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId)
        setIsFollowing(false)
        onToggle?.(false)
      } else {
        await followUser(targetUserId)
        setIsFollowing(true)
        onToggle?.(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full font-semibold transition-colors ${
        fullWidth ? 'flex-1 px-4 py-[11px] text-sm font-bold' : 'px-4 py-1.5 text-sm'
      } ${
        isFollowing
          ? 'border border-stone-border bg-transparent text-stone-secondary'
          : 'bg-ember text-white hover:bg-ember-dark'
      } disabled:opacity-50`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
