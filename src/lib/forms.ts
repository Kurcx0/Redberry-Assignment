import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/api/client'

export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (!(error instanceof ApiError) || !error.errors) return false

  Object.entries(error.errors).forEach(([field, messages]) => {
    setError(field as Path<T>, { type: 'server', message: messages[0] }, { shouldFocus: true })
  })

  return true
}
