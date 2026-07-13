import type { LifeEvent, Note } from '../types'

interface YearTimelineProps {
  notes: Note[]
  events: LifeEvent[]
  selectedYear: number | null
  onSelectYear: (year: number | null) => void
}

export function YearTimeline({ notes, events, selectedYear, onSelectYear }: YearTimelineProps) {
  const yearCounts = new Map<number, number>()
  for (const note of notes) {
    const iso = note.created ?? note.updated
    if (!iso) continue
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) continue
    const year = date.getFullYear()
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1)
  }

  const eventsByYear = new Map<number, LifeEvent[]>()
  for (const event of events) {
    const list = eventsByYear.get(event.year) ?? []
    list.push(event)
    eventsByYear.set(event.year, list)
  }

  const years = Array.from(new Set([...yearCounts.keys(), ...eventsByYear.keys()])).sort((a, b) => a - b)

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
      {years.map((year) => {
        const yearEvents = eventsByYear.get(year)
        return (
          <button
            key={year}
            type="button"
            className={selectedYear === year ? 'year-chip is-active' : 'year-chip'}
            onClick={() => onSelectYear(year)}
          >
            <span className="year-chip-year-row">
              {year} <span className="year-chip-count">({yearCounts.get(year) ?? 0})</span>
            </span>
            {yearEvents && <span className="year-chip-event">🎯{yearEvents.map((e) => e.label).join('・')}</span>}
          </button>
        )
      })}
    </nav>
  )
}
