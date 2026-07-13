import type { Note } from '../types'

export interface OnThisDayEntry {
  year: number
  note: Note
}

/** Notes written on the same month/day as `today` (any year), oldest first. */
export function getOnThisDayNotes(notes: Note[], today: Date = new Date()): OnThisDayEntry[] {
  const month = today.getMonth()
  const day = today.getDate()

  const entries: OnThisDayEntry[] = []
  for (const note of notes) {
    const iso = note.created ?? note.updated
    if (!iso) continue
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) continue
    if (date.getMonth() === month && date.getDate() === day) {
      entries.push({ year: date.getFullYear(), note })
    }
  }

  return entries.sort((a, b) => (a.note.created ?? a.note.updated ?? '').localeCompare(b.note.created ?? b.note.updated ?? ''))
}
