import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { logout } from '@/api/auth'
import type { User } from '@/api/types'
import { CheckIcon, ChevronDownIcon, LogOutIcon, TicketIcon, UserIcon } from '@/components/icons'
import Avatar from '@/components/ui/Avatar'
import { clearSession } from '@/lib/auth'

export default function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!open) return

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await logout().catch(() => undefined)
    clearSession()
    if (pathname.startsWith('/profile')) navigate('/')
  }

  const firstName = (user.fullName || user.username).split(' ')[0]

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-white/8"
      >
        <span className="relative">
          <Avatar user={user} />
          <span
            className={clsx(
              'absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-page',
              user.profileComplete ? 'bg-success' : 'bg-warning',
            )}
          />
        </span>
        <span className="text-sm font-semibold">{firstName}</span>
        <ChevronDownIcon className={clsx('size-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-3 w-[300px] rounded-2xl border border-line bg-[#080c18] p-2 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar user={user} className="size-10" />
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
              onClick={() => setOpen(false)}
              className="mx-1 mb-2 block rounded-xl bg-warning/10 px-3 py-2.5 transition-colors hover:bg-warning/15"
            >
              <span className="block text-sm font-semibold text-warning">Profile incomplete</span>
              <span className="block text-xs text-warning/80">
                Please complete your profile to enable booking.
              </span>
            </Link>
          )}

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/6"
          >
            <UserIcon className="size-4 text-muted" />
            My Profile
          </Link>
          <Link
            to="/profile?tab=tickets"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/6"
          >
            <TicketIcon className="size-4 text-muted" />
            My Tickets
          </Link>

          <div className="mx-3 my-2 border-t border-line" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <LogOutIcon />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
