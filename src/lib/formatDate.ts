export function formatDateLabel(iso: string | null): string {
  if (!iso) return '日付不明'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '日付不明'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

export function formatDateTimeLabel(iso: string | null): string {
  if (!iso) return '日付不明'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '日付不明'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
