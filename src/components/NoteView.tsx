import type { Note } from '../types'
import { formatDateTimeLabel } from '../lib/formatDate'

interface NoteViewProps {
  note: Note | null
}

export function NoteView({ note }: NoteViewProps) {
  if (!note) {
    return (
      <div className="note-view note-view-empty">
        <p>左の一覧から日記を選んでください</p>
      </div>
    )
  }

  return (
    <article className="note-view">
      <header className="note-view-header">
        <h2>{note.title}</h2>
        <div className="note-view-meta">
          <span>{formatDateTimeLabel(note.created)}</span>
          {note.updated && note.updated !== note.created && (
            <span className="note-view-updated">(更新: {formatDateTimeLabel(note.updated)})</span>
          )}
        </div>
        {note.tags.length > 0 && (
          <div className="note-view-tags">
            {note.tags.map((tag) => (
              <span key={tag} className="note-view-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
      {/* eslint-disable-next-line react/no-danger -- contentHtml is sanitized via DOMPurify in enmlToHtml */}
      <div className="note-view-body" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
    </article>
  )
}
