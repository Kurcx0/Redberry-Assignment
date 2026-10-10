import dayjs from 'dayjs'

export function formatPrice(value: number) {
  return `₾${Number.isInteger(value) ? value : value.toFixed(2)}`
}

export function formatRuntime(minutes: number) {
  return `${minutes} min`
}

export function today() {
  return dayjs().format('YYYY-MM-DD')
}

export function upcomingDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const day = dayjs().add(index, 'day')
    return {
      value: day.format('YYYY-MM-DD'),
      weekday: day.format('ddd'),
      day: day.format('D'),
    }
  })
}

export function sessionDateTime(date: string, time: string) {
  return dayjs(`${date}T${time}`)
}

export function formatShortDate(date: string) {
  return dayjs(date).format('ddd D MMM')
}

export function formatLongDate(date: string) {
  return dayjs(date).format('dddd D MMMM')
}

export function formatReleaseDate(date: string) {
  return dayjs(date).format('D MMMM YYYY')
}
