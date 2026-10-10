import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { logout } from '@/api/auth'
import type { User } from '@/api/types'
import { CheckIcon, ChevronDownIcon, LogOutIcon, TicketIcon, UserIcon } from '@/components/icons'
import Avatar from '@/components/ui/Avatar'
import { useClickOutside } from '@/hooks/useClickOutside'
import { clearSession } from '@/lib/auth'

function StatusAvatar({ user }: { user: User }) {
  return (
    <span className="relative shrink-0">
      <Avatar user={user} />
      <span
        className={clsx(
          'absolute right-0 bottom-0 size-2 rounded-full ring-1 ring-page',
          user.profileComplete ? 'bg-success' : 'bg-warning',
        )}
      />
    </span>
  )
}

const itemClasses = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors'

export default function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const close = useCallback(() => setOpen(false), [])

  useClickOutside(containerRef, open, close)

  async function handleLogout() {
    close()
    await logout().catch(() => undefined)
    clearSession()
    if (pathname.startsWith('/profile')) navigate('/')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3"
      >
        <StatusAvatar user={user} />
        <span className="max-w-[140px] truncate text-sm font-semibold" title={user.username}>
          {user.username}
        </span>
        <ChevronDownIcon className={clsx('ml-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-4 w-[300px] rounded-2xl border border-line bg-page p-2 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <StatusAvatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName || user.username}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          {user.profileComplete ? (
            <div className="mx-1 mb-2 flex items-center justify-between rounded-xl bg-success/10 px-3 py-2.5 text-sm font-semibold text-success">
              Profile Complete
              <CheckIcon />
            </div>
          ) : (
            <Link
              to="/profile"
              onClick={close}
              className="mx-1 mb-2 block rounded-xl bg-warning/10 px-3 py-2.5 transition-colors hover:bg-warning/15"
            >
              <span className="block text-sm font-semibold text-warning">Profile incomplete</span>
              <span className="block text-xs text-warning/80">Please complete your profile to enable booking.</span>
            </Link>
          )}

          <Link to="/profile" role="menuitem" onClick={close} className={clsx(itemClasses, 'hover:bg-surface')}>
            <UserIcon className="text-muted" />
            My Profile
          </Link>
          <Link
            to="/profile?tab=tickets"
            role="menuitem"
            onClick={close}
            className={clsx(itemClasses, 'hover:bg-surface')}
          >
            <TicketIcon className="text-muted" />
            My Tickets
          </Link>

          <div className="mx-3 my-2 border-t border-line" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={clsx(itemClasses, 'text-primary hover:bg-primary/10')}
          >
            <LogOutIcon />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
