import { useEffect, useMemo, useRef, useState } from 'react'
import type { Note } from '../types'
import { formatDateTimeLabel } from '../lib/formatDate'
import { withNaturalLineBreaks } from '../lib/naturalLineBreaks'
import { OnThisDay } from './OnThisDay'

interface NoteViewProps {
  note: Note | null
  allNotes: Note[]
  onSelectNote: (id: string) => void
}

export function NoteView({ note, allNotes, onSelectNote }: NoteViewProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [naturalBreaks, setNaturalBreaks] = useState(true)

  const displayHtml = useMemo(() => {
    if (!note) return ''
    return naturalBreaks ? withNaturalLineBreaks(note.contentHtml) : note.contentHtml
  }, [note, naturalBreaks])

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
  }, [note, displayHtml])

  if (!note) {
    return (
      <div className="note-view note-view-empty">
        <OnThisDay notes={allNotes} onSelectNote={onSelectNote} />
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
        <button
          type="button"
          className="note-view-format-toggle"
          onClick={() => setNaturalBreaks((v) => !v)}
        >
          {naturalBreaks ? '改行: 自然な位置で調整中(元の表示に戻す)' : '改行: 元のまま(自然な位置で調整する)'}
        </button>
      </header>
      {/* eslint-disable-next-line react/no-danger -- displayHtml is derived from contentHtml, which is sanitized via DOMPurify in enmlToHtml; withNaturalLineBreaks only ever adds <br> elements */}
      <div ref={bodyRef} className="note-view-body" dangerouslySetInnerHTML={{ __html: displayHtml }} />
    </article>
  )
}
