/*
 * The profile's page header is the player: avatar, name as the page
 * title, a meta line, and the screen's one action on the right. Identity
 * comes from the Neon Auth session; the meta line from /api/me, shown as
 * a placeholder bar until it lands.
 */
const ProfileHeader = ({ user, meta, isLoading, action }) => {
  const name = user.displayName ?? 'Anonymous'

  return (
    <div className="flex flex-wrap items-center gap-4 bg-surface p-4">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="size-12 shrink-0 rounded-full"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg text-label text-muted"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-title font-medium tracking-tight text-heading">
          {name}
        </h1>
        {isLoading ? (
          <span aria-hidden="true" className="mt-1.5 block h-3 w-56 bg-edge" />
        ) : (
          meta && <p className="mt-0.5 text-ui text-muted">{meta}</p>
        )}
      </div>

      {action}
    </div>
  )
}

export default ProfileHeader
