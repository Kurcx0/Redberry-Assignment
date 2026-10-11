import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { updateProfile } from '@/api/auth'
import { ApiError } from '@/api/client'
import type { User } from '@/api/types'
import { CheckIcon, ChevronDownIcon, ErrorIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import DateField from '@/components/ui/DateField'
import TextField from '@/components/ui/TextField'
import { useFilterOptions } from '@/hooks/useFilterOptions'
import { applyServerErrors } from '@/lib/forms'
import { profileSchema, type ProfileValues } from '@/lib/validation'
import { toast } from '@/stores/toast'

function toFormValues(user: User): ProfileValues {
  return {
    fullName: user.fullName ?? '',
    mobileNumber: user.mobileNumber ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    preferredVenueId: user.preferredVenue ? String(user.preferredVenue.id) : '',
  }
}

function eligibility(age: number) {
  if (age >= 18) return `You are ${age}, you can buy tickets for all age ratings.`
  if (age >= 16) return `You are ${age}, you cannot buy tickets for 18+ titles.`
  return `You are ${age}, you cannot buy tickets for 16+ or 18+ titles.`
}

export default function PersonalInfoForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const { data: options } = useFilterOptions()
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, touchedFields, isDirty, isValid },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: toFormValues(user),
  })

  const mutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      updateProfile({
        fullName: values.fullName.trim(),
        mobileNumber: values.mobileNumber.replace(/\s/g, ''),
        dateOfBirth: values.dateOfBirth,
        preferredVenueId: values.preferredVenueId ? Number(values.preferredVenueId) : null,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
      reset(toFormValues(updated))
      toast.success(
        updated.profileComplete && !user.profileComplete
          ? 'Your profile is complete. Happy booking!'
          : 'Your changes have been saved.',
      )
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError) && error instanceof ApiError) toast.error(error.message)
    },
  })

  const fieldState = (name: keyof ProfileValues) => ({
    error: errors[name]?.message,
    valid: !!touchedFields[name] && !errors[name],
  })

  return (
    <div className="max-w-[876px]">
      {user.profileComplete ? (
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-semibold text-success">
          Profile Complete
          <CheckIcon className="size-4" />
        </div>
      ) : (
        <div role="status" className="mb-8 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <ErrorIcon className="mt-0.5 size-4" />
          <div>
            <p className="font-semibold">Please complete your profile to enable booking.</p>
            <p className="mt-0.5 text-warning/80">Full name, mobile number and date of birth are required to buy tickets.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="e.g. Nino Beridze"
          {...fieldState('fullName')}
          {...register('fullName')}
        />
        <TextField label="Email" value={user.email} disabled readOnly hint="Set at registration and cannot be changed" />
        <TextField
          label="Mobile number"
          type="tel"
          autoComplete="tel-national"
          placeholder="5XX XXX XXX"
          {...fieldState('mobileNumber')}
          {...register('mobileNumber')}
        />
        <div>
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <DateField
                label="Date of birth"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                min="1900-01-01"
                max={dayjs().format('YYYY-MM-DD')}
                placeholder="Select your date of birth"
                {...fieldState('dateOfBirth')}
              />
            )}
          />
          {user.age !== null && !errors.dateOfBirth && (
            <p className={clsx('mt-1.5 text-xs', user.age >= 18 ? 'text-muted' : 'text-warning')}>
              {eligibility(user.age)}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="preferred-venue" className="mb-2 block text-[13px] font-semibold">
            Preferred Venue <span className="font-normal text-muted">(Optional)</span>
          </label>
          <div className="relative">
            <select
              id="preferred-venue"
              {...register('preferredVenueId')}
              className="h-10 w-full appearance-none rounded-lg border border-transparent bg-surface px-3.5 text-[13px] outline-none focus:border-white/25"
            >
              <option value="">No preference</option>
              {options?.venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} · {venue.city}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <Button type="submit" className="mt-3" disabled={!isDirty || !isValid} loading={mutation.isPending}>
          Save changes
        </Button>
      </form>
    </div>
  )
}
