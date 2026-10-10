import clsx from 'clsx'
import type { User } from '@/api/types'

type AvatarProps = {
  user: Pick<User, 'avatar' | 'fullName' | 'username'>
  className?: string
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Avatar({ user, className }: AvatarProps) {
  const name = user.fullName || user.username

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={clsx('shrink-0 rounded-full object-cover', className ?? 'size-9')}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-extrabold text-white',
        className ?? 'size-9',
      )}
    >
      {initials(name)}
    </span>
  )
}
