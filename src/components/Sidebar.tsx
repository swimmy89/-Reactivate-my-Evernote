import { UploadPanel } from './UploadPanel'
import { LifeEvents } from './LifeEvents'
import type { LifeEvent, Note } from '../types'

interface SidebarProps {
  notes: Note[]
  query: string
  onQueryChange: (query: string) => void
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
  onImported: (notes: Note[]) => void
  onClearAll: () => void
  onRandomNote: () => void
  lifeEvents: LifeEvent[]
  onAddLifeEvent: (year: number, label: string) => void
  onDeleteLifeEvent: (id: string) => void
}

export function Sidebar({
  notes,
  query,
  onQueryChange,
  selectedTag,
  onSelectTag,
  onImported,
  onClearAll,
  onRandomNote,
  lifeEvents,
  onAddLifeEvent,
  onDeleteLifeEvent,
}: SidebarProps) {
  const tagCounts = new Map<string, number>()
  for (const note of notes) {
    for (const tag of note.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>📔 My Evernote Diary</h1>
      </div>

      <input
        type="search"
        className="search-input"
        placeholder="日記を検索…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <button type="button" className="random-note-button" onClick={onRandomNote} disabled={notes.length === 0}>
        🎲 ランダムに1件
      </button>

      <div className="sidebar-section">
        <h2>タグ</h2>
        <ul className="tag-list">
          <li>
            <button
              type="button"
              className={selectedTag === null ? 'tag-chip is-active' : 'tag-chip'}
              onClick={() => onSelectTag(null)}
            >
              すべて ({notes.length})
            </button>
          </li>
          {sortedTags.map(([tag, count]) => (
            <li key={tag}>
              <button
                type="button"
                className={selectedTag === tag ? 'tag-chip is-active' : 'tag-chip'}
                onClick={() => onSelectTag(tag)}
              >
                {tag} ({count})
              </button>
            </li>
          ))}
        </ul>
      </div>

      <LifeEvents events={lifeEvents} onAdd={onAddLifeEvent} onDelete={onDeleteLifeEvent} />

      <div className="sidebar-footer">
        <UploadPanel onImported={onImported} compact />
        {notes.length > 0 && (
          <button type="button" className="clear-all-button" onClick={onClearAll}>
            すべてのデータを削除
          </button>
        )}
      </div>
    </aside>
  )
}
