import type { Note } from '../types'

interface YearTimelineProps {
  notes: Note[]
  selectedYear: number | null
  onSelectYear: (year: number | null) => void
}

export function YearTimeline({ notes, selectedYear, onSelectYear }: YearTimelineProps) {
  const yearCounts = new Map<number, number>()
  for (const note of notes) {
    const iso = note.created ?? note.updated
    if (!iso) continue
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) continue
    const year = date.getFullYear()
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1)
  }
  const years = Array.from(yearCounts.keys()).sort((a, b) => a - b)

  if (years.length === 0) return null

  return (
    <nav className="year-timeline">
      <button
        type="button"
        className={selectedYear === null ? 'year-chip is-active' : 'year-chip'}
        onClick={() => onSelectYear(null)}
      >
        すべて
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          className={selectedYear === year ? 'year-chip is-active' : 'year-chip'}
          onClick={() => onSelectYear(year)}
        >
          {year}
          <span className="year-chip-count">({yearCounts.get(year)})</span>
        </button>
      ))}
    </nav>
  )
}
