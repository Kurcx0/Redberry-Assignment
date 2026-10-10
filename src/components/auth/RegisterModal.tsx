import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { register as registerAccount } from '@/api/auth'
import { ApiError } from '@/api/client'
import { UserIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/TextField'
import { cancelLogin, completeLogin } from '@/lib/auth'
import { applyServerErrors } from '@/lib/forms'
import { registerSchema, type RegisterValues } from '@/lib/validation'
import { useAuthModal } from '@/stores/authModal'

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_SIZE = 2 * 1024 * 1024

export default function RegisterModal() {
  const isOpen = useAuthModal((state) => state.modal === 'register')

  return (
    <Modal open={isOpen} onClose={cancelLogin} className="max-w-[474px]" labelledBy="register-title">
      <RegisterForm />
    </Modal>
  )
}

function RegisterForm() {
  const openModal = useAuthModal((state) => state.open)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, touchedFields },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { username: '', email: '', password: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (!avatar) return
    const url = URL.createObjectURL(avatar)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatar])

  const mutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: ({ user, token }) => completeLogin(user, token),
    onError: (error) => {
      applyServerErrors(error, setError)
      if (error instanceof ApiError && error.errors?.avatar) setAvatarError(error.errors.avatar[0])
    },
  })

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Please upload a JPG, PNG or WEBP image')
      return
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setAvatarError('The image must be smaller than 2 MB')
      return
    }

    setAvatarError(null)
    setAvatar(file)
  }

  function onSubmit(values: RegisterValues) {
    const data = new FormData()
    Object.entries(values).forEach(([key, value]) => data.append(key, value))
    if (avatar) data.append('avatar', avatar)
    mutation.mutate(data)
  }

  const values = watch()
  const isEmpty = Object.values(values).some((value) => !value)
  const fieldState = (name: keyof RegisterValues) => ({
    error: errors[name]?.message,
    valid: touchedFields[name] && !errors[name],
  })
  const formError =
    mutation.error instanceof ApiError && !mutation.error.isValidation ? mutation.error.message : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-8">
      <h2 id="register-title" className="text-[22px] font-bold">
        Sign up
      </h2>
      <p className="mt-1 text-[13px] text-muted">Welcome to Kino XII</p>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group flex items-center gap-3 text-left"
        >
          <span
            className={clsx(
              'flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-surface transition-colors',
              avatarError ? 'border-primary' : 'border-transparent group-hover:border-white/25',
            )}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="size-full object-cover" />
            ) : (
              <UserIcon className="size-5 text-muted" />
            )}
          </span>
          <span>
            <span className="block text-[13px] font-semibold">
              {avatar ? 'Change avatar' : 'Upload avatar (optional)'}
            </span>
            <span className="block text-[11px] text-muted">JPG, PNG or WEBP</span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
        {avatarError && <p className="mt-2 text-xs text-primary">{avatarError}</p>}
      </div>

      <div className="mt-5 space-y-4">
        <TextField
          label="Username"
          autoComplete="username"
          placeholder="Username"
          {...fieldState('username')}
          {...register('username')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          {...fieldState('email')}
          {...register('email')}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...fieldState('password')}
            {...register('password', { deps: ['password_confirmation'] })}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...fieldState('password_confirmation')}
            {...register('password_confirmation')}
          />
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-4 rounded-lg bg-primary/10 px-3.5 py-2.5 text-[13px] text-primary">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={isEmpty}
        loading={mutation.isPending}
      >
        Sign up
      </Button>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => openModal('login')}
          className="font-semibold text-primary hover:underline"
        >
          Log in
        </button>
      </p>
    </form>
  )
}
