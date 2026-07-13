import type { LifeEvent, Note } from '../types'
import { getTopWords } from './wordFrequency'

/**
 * Builds a short (roughly 100-300 character) "year in review" paragraph
 * from statistics about the year's entries — note count, busiest month,
 * top words, top tag, total volume written — plus any registered life
 * event for that year. This is a templated statistical summary, not an
 * AI-generated one, so it never leaves the browser.
 */
export function buildYearReview(year: number, notes: Note[], lifeEvents: LifeEvent[]): string {
  if (notes.length === 0) {
    return `${year}年の日記はまだ見つかりませんでした。`
  }

  const parts: string[] = []

  const eventLabels = lifeEvents.filter((e) => e.year === year).map((e) => e.label)
  parts.push(
    eventLabels.length > 0 ? `${year}年は「${eventLabels.join('」「')}」の年でした。` : `${year}年を振り返ります。`,
  )

  parts.push(`日記は${notes.length}件書きました。`)

  const monthCounts = new Map<number, number>()
  for (const note of notes) {
    const iso = note.created ?? note.updated
    if (!iso) continue
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) continue
    const month = date.getMonth() + 1
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1)
  }
  const busiestMonth = Array.from(monthCounts.entries()).sort((a, b) => b[1] - a[1])[0]
  if (busiestMonth) {
    parts.push(`${busiestMonth[0]}月が一番よく書いた月でした。`)
  }

  const topWords = getTopWords(notes, 3)
  if (topWords.length > 0) {
    parts.push(`よく使っていた言葉は「${topWords.map((w) => w.word).join('」「')}」でした。`)
  }

  const tagCounts = new Map<string, number>()
  for (const note of notes) {
    for (const tag of note.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const topTag = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])[0]
  if (topTag) {
    parts.push(`「${topTag[0]}」というタグをよく使っていました。`)
  }

  const totalChars = notes.reduce((sum, n) => sum + n.plainText.length, 0)
  parts.push(`合計で約${totalChars.toLocaleString('ja-JP')}文字の記録が残っています。`)

  return parts.join('')
}
