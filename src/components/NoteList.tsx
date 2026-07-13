import type { Note } from '../types'
import { formatDateLabel } from '../lib/formatDate'

interface NoteListProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
}

export function NoteList({ notes, selectedNoteId, onSelectNote }: NoteListProps) {
  if (notes.length === 0) {
    return <div className="note-list note-list-empty">該当する日記がありません</div>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className={note.id === selectedNoteId ? 'note-list-item is-active' : 'note-list-item'}
            onClick={() => onSelectNote(note.id)}
          >
            <span className="note-list-date">{formatDateLabel(note.created ?? note.updated)}</span>
            <span className="note-list-title">{note.title}</span>
            <span className="note-list-snippet">{note.plainText.slice(0, 60)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
