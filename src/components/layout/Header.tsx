import clsx from 'clsx'
import { NavLink } from 'react-router'
import { SearchIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import { useMe } from '@/hooks/useMe'
import { useAuthModal } from '@/stores/authModal'
import { useUiStore } from '@/stores/ui'
import Logo from './Logo'
import UserMenu from './UserMenu'

export default function Header({ overlay }: { overlay: boolean }) {
  const { user, isLoading } = useMe()
  const openAuth = useAuthModal((state) => state.open)
  const openSearch = useUiStore((state) => state.openSearch)

  return (
    <header
      className={clsx(
        'inset-x-0 top-0 z-30 flex h-24 items-center px-[60px]',
        overlay ? 'absolute bg-gradient-to-b from-black/60 to-transparent' : 'relative',
      )}
    >
      <Logo />

      <nav className="ml-16">
        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            clsx(
              'text-sm font-semibold tracking-wide uppercase transition-colors hover:text-white',
              isActive ? 'text-white' : 'text-white/85',
            )
          }
        >
          Sessions
        </NavLink>
      </nav>

      <div className="ml-auto flex items-center gap-8">
        <button
          type="button"
          onClick={openSearch}
          className="flex h-[38px] w-[380px] items-center gap-2.5 rounded-full border border-white/10 bg-white/8 px-4 text-left text-[13px] text-white/60 backdrop-blur-md transition-colors hover:border-white/25"
        >
          <SearchIcon />
          Search films and live events
        </button>

        {user ? (
          <UserMenu user={user} />
        ) : (
          <div className={clsx('flex items-center gap-3', isLoading && 'invisible')}>
            <Button onClick={() => openAuth('register')} className="w-24">
              Sign up
            </Button>
            <Button variant="light" onClick={() => openAuth('login')} className="w-[86px]">
              Log in
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
