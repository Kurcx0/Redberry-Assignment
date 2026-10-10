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
        'inset-x-0 top-0 z-30 flex h-[111px] items-start bg-[linear-gradient(180deg,rgb(0_0_0/0.57)_0px,rgb(0_0_0/0.51)_36px,transparent_104px)] px-[60px] pt-[30px]',
        overlay ? 'absolute' : 'relative',
      )}
    >
      <div className="flex h-[41px] items-center">
        <Logo />
        <nav className="ml-9">
          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              clsx(
                'text-xs font-semibold tracking-[0.08em] uppercase transition-colors hover:text-white',
                isActive ? 'text-white' : 'text-white/85',
              )
            }
          >
            Sessions
          </NavLink>
        </nav>
      </div>

      <div className="ml-auto flex h-[41px] items-center gap-8">
        <button
          type="button"
          onClick={openSearch}
          data-search-anchor
          className="flex h-[41px] w-[380px] items-center gap-2 rounded-full bg-white/10 px-4 text-left text-[13px] text-white transition-colors hover:bg-white/15"
        >
          <SearchIcon />
          Search films and live events
        </button>

        {user ? (
          <UserMenu user={user} />
        ) : (
          <div className={clsx('flex items-center gap-3', isLoading && 'invisible')}>
            <Button onClick={() => openAuth('register')}>
              Sign up
            </Button>
            <Button variant="light" onClick={() => openAuth('login')}>
              Log in
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
