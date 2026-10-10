import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { login } from '@/api/auth'
import { ApiError } from '@/api/client'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/TextField'
import { applyServerErrors } from '@/lib/forms'
import { cancelLogin, completeLogin } from '@/lib/auth'
import { loginSchema, type LoginValues } from '@/lib/validation'
import { useAuthModal } from '@/stores/authModal'

export default function LoginModal() {
  const isOpen = useAuthModal((state) => state.modal === 'login')

  return (
    <Modal open={isOpen} onClose={cancelLogin} className="max-w-[404px]" labelledBy="login-title">
      <LoginForm />
    </Modal>
  )
}

function LoginForm() {
  const openModal = useAuthModal((state) => state.open)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, touchedFields },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, token }) => completeLogin(user, token),
    onError: (error) => applyServerErrors(error, setError),
  })

  const [email, password] = watch(['email', 'password'])
  const formError =
    mutation.error instanceof ApiError && !mutation.error.isValidation ? mutation.error.message : null

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="p-8">
      <h2 id="login-title" className="text-[22px] font-extrabold">
        Log in
      </h2>
      <p className="mt-1 text-[13px] text-muted">Welcome back to Kino XII</p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          valid={touchedFields.email && !errors.email}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          valid={touchedFields.password && !errors.password}
          {...register('password')}
        />
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
        disabled={!email || !password}
        loading={mutation.isPending}
      >
        Log in
      </Button>

      <p className="mt-5 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => openModal('register')}
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  )
}
