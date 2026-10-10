import clsx from 'clsx'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { UserIcon } from '@/components/icons'
import MyTickets from '@/components/profile/MyTickets'
import PersonalInfoForm from '@/components/profile/PersonalInfoForm'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { useMe } from '@/hooks/useMe'
import { useTickets } from '@/hooks/useTickets'
import { requestLogin } from '@/lib/auth'
import { useAuthStore } from '@/stores/auth'

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) requestLogin().catch(() => navigate('/'))
  }, [token, navigate])

  return (
    <section className="px-[52px] pt-6 pb-24">
      <h1 className="text-[28px] font-extrabold">My Profile</h1>
      {token ? (
        <ProfileContent />
      ) : (
        <EmptyState
          icon={<UserIcon />}
          title="Log in to see your profile"
          description="Your personal information and tickets are available after logging in."
          action={<Button onClick={() => requestLogin().catch(() => undefined)}>Log in</Button>}
          className="mt-10 rounded-2xl bg-surface/50"
        />
      )}
    </section>
  )
}

function ProfileContent() {
  const { user, isLoading } = useMe()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'tickets' ? 'tickets' : 'info'
  const { data: tickets } = useTickets()
  const upcomingCount = tickets?.filter((order) => order.isUpcoming).length ?? 0

  const tabs = [
    { id: 'info', label: 'Personal Information' },
    { id: 'tickets', label: 'My Tickets' },
  ] as const

  return (
    <>
      <div className="mt-6 flex gap-8 border-b border-line" role="tablist" aria-label="Profile sections">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setParams(item.id === 'info' ? {} : { tab: item.id }, { preventScrollReset: true })}
            className={clsx(
              '-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors',
              tab === item.id ? 'border-primary text-white' : 'border-transparent text-muted hover:text-white',
            )}
          >
            {item.label}
            {item.id === 'tickets' && upcomingCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-white">
                {upcomingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'tickets' ? (
          <MyTickets />
        ) : isLoading || !user ? (
          <div className="max-w-[876px] space-y-5">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-[66px] w-full" />
            ))}
          </div>
        ) : (
          <PersonalInfoForm key={user.id} user={user} />
        )}
      </div>
    </>
  )
}
