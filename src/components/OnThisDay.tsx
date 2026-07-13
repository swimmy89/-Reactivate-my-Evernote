import type { Note } from '../types'
import { getOnThisDayNotes } from '../lib/onThisDay'

interface OnThisDayProps {
  notes: Note[]
  onSelectNote: (id: string) => void
}

export function OnThisDay({ notes, onSelectNote }: OnThisDayProps) {
  const today = new Date()
  const entries = getOnThisDayNotes(notes, today)
  const dateLabel = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric' }).format(today)

  return (
    <div className="on-this-day">
      <h2 className="on-this-day-heading">📅 今日は{dateLabel}</h2>
      {entries.length === 0 ? (
        <p className="on-this-day-empty">この日付に書いた日記はまだ見つかりませんでした。</p>
      ) : (
        <ul className="on-this-day-list">
          {entries.map(({ year, note }) => (
            <li key={note.id}>
              <button type="button" className="on-this-day-item" onClick={() => onSelectNote(note.id)}>
                <span className="on-this-day-year">
                  {year}年({today.getFullYear() - year}年前)
                </span>
                <span className="on-this-day-title">{note.title}</span>
                <span className="on-this-day-snippet">{note.plainText.slice(0, 80)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
