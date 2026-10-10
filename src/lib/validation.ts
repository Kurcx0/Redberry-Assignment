import dayjs from 'dayjs'
import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

const password = z.string().min(1, 'Password is required').min(3, 'At least 3 characters')

export const loginSchema = z.object({ email, password })

export const registerSchema = z
  .object({
    username: z.string().trim().min(1, 'Username is required').min(3, 'At least 3 characters'),
    email,
    password,
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  })

const mobileNumber = z
  .string()
  .transform((value) => value.replace(/\s/g, ''))
  .superRefine((value, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message })

    if (!value) return issue('Mobile number is required')
    if (!/^\d+$/.test(value)) {
      return issue('Please enter a valid Georgian mobile number (9 digits starting with 5)')
    }
    if (!value.startsWith('5')) return issue('Georgian mobile numbers must start with 5')
    if (value.length !== 9) return issue('Mobile number must be exactly 9 digits')
  })

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),
  mobileNumber,
  dateOfBirth: z.string().superRefine((value, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message })
    const date = dayjs(value)

    if (!value) return issue('Date of birth is required')
    if (!date.isValid() || date.isAfter(dayjs(), 'day')) {
      return issue('Please enter a valid date of birth')
    }
    if (date.isAfter(dayjs().subtract(12, 'year'), 'day')) {
      return issue('You must be at least 12 years old to create an account')
    }
  }),
  preferredVenueId: z.string(),
})

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email,
  mobileNumber,
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .refine((value) => value.length > 0, 'Card number is required')
    .refine((value) => /^\d{16}$/.test(value), 'Card number must be 16 digits'),
  expiry: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value), 'Use the MM/YY format')
    .refine((value) => {
      const [month, year] = value.split('/').map(Number)
      return dayjs(`20${year}-${month}-01`).endOf('month').isAfter(dayjs())
    }, 'Card has expired'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .refine((value) => /^\d{3}$/.test(value), 'CVV must be 3 digits'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ProfileValues = z.input<typeof profileSchema>
export type CheckoutValues = z.input<typeof checkoutSchema>
