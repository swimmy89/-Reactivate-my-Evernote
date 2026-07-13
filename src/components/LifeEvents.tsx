import { useState, type FormEvent } from 'react'
import type { LifeEvent } from '../types'

interface LifeEventsProps {
  events: LifeEvent[]
  onAdd: (year: number, label: string) => void
  onDelete: (id: string) => void
}

export function LifeEvents({ events, onAdd, onDelete }: LifeEventsProps) {
  const [year, setYear] = useState('')
  const [label, setLabel] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsedYear = Number(year)
    if (!Number.isFinite(parsedYear) || !label.trim()) return
    onAdd(parsedYear, label.trim())
    setYear('')
    setLabel('')
  }

  const sortedEvents = [...events].sort((a, b) => a.year - b.year)

  return (
    <div className="sidebar-section">
      <h2>人生のイベント</h2>
      {sortedEvents.length > 0 && (
        <ul className="life-event-list">
          {sortedEvents.map((event) => (
            <li key={event.id} className="life-event-item">
              <span className="life-event-year">{event.year}</span>
              <span className="life-event-label">{event.label}</span>
              <button
                type="button"
                className="life-event-delete"
                onClick={() => onDelete(event.id)}
                aria-label={`${event.label}を削除`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="life-event-form" onSubmit={handleSubmit}>
        <input
          type="number"
          className="life-event-year-input"
          placeholder="年"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          type="text"
          className="life-event-label-input"
          placeholder="例: 就職"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="submit" className="life-event-add-button">
          追加
        </button>
      </form>
    </div>
  )
}
