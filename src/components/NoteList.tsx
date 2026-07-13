import type { Note } from '../types'
import { formatDateLabel } from '../lib/formatDate'

interface NoteListProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
  /** Group consecutive notes by year — used for search results, so a theme reads as a timeline. */
  groupByYear?: boolean
}

export function NoteList({ notes, selectedNoteId, onSelectNote, groupByYear = false }: NoteListProps) {
  if (notes.length === 0) {
    return <div className="note-list note-list-empty">該当する日記がありません</div>
  }

  if (!groupByYear) {
    return (
      <ul className="note-list">
        {notes.map((note) => (
          <NoteListItem key={note.id} note={note} isActive={note.id === selectedNoteId} onSelectNote={onSelectNote} />
        ))}
      </ul>
    )
  }

  const groups: { year: string; notes: Note[] }[] = []
  for (const note of notes) {
    const iso = note.created ?? note.updated
    const year = iso ? String(new Date(iso).getFullYear()) : '日付不明'
    const currentGroup = groups[groups.length - 1]
    if (currentGroup && currentGroup.year === year) {
      currentGroup.notes.push(note)
    } else {
      groups.push({ year, notes: [note] })
    }
  }

  return (
    <div className="note-list note-list-grouped">
      {groups.map((group) => (
        <div key={group.year} className="note-list-year-group">
          <h3 className="note-list-year-heading">{group.year}年</h3>
          <ul>
            {group.notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === selectedNoteId}
                onSelectNote={onSelectNote}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function NoteListItem({
  note,
  isActive,
  onSelectNote,
}: {
  note: Note
  isActive: boolean
  onSelectNote: (id: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        className={isActive ? 'note-list-item is-active' : 'note-list-item'}
        onClick={() => onSelectNote(note.id)}
      >
        <span className="note-list-date">{formatDateLabel(note.created ?? note.updated)}</span>
        <span className="note-list-title">{note.title}</span>
        <span className="note-list-snippet">{note.plainText.slice(0, 60)}</span>
      </button>
    </li>
  )
}
