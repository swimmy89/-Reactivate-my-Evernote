import { useEffect, useRef } from 'react'
import type { Note } from '../types'
import { formatDateTimeLabel } from '../lib/formatDate'

interface NoteViewProps {
  note: Note | null
}

export function NoteView({ note }: NoteViewProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  // contentHtml only carries `data-resource-hash` placeholders for images/audio/
  // attachments (see enmlToHtml); the actual bytes live in note.resources as
  // Blobs and get turned into object URLs here, at display time, so a note's
  // attachments only ever exist as one in-memory copy instead of being baked
  // as base64 into every stored note's HTML.
  useEffect(() => {
    const container = bodyRef.current
    if (!container || !note) return

    const resourceByHash = new Map(note.resources.map((r) => [r.hash, r]))
    const objectUrls: string[] = []

    container.querySelectorAll<HTMLElement>('[data-resource-hash]').forEach((el) => {
      const hash = el.getAttribute('data-resource-hash')
      const resource = hash ? resourceByHash.get(hash) : undefined
      if (!resource?.blob) return

      const url = URL.createObjectURL(resource.blob)
      objectUrls.push(url)
      if (el instanceof HTMLImageElement || el instanceof HTMLAudioElement) {
        el.src = url
      } else if (el instanceof HTMLAnchorElement) {
        el.href = url
      }
    })

    return () => {
      for (const url of objectUrls) URL.revokeObjectURL(url)
    }
  }, [note])

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
      <div ref={bodyRef} className="note-view-body" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
    </article>
  )
}
