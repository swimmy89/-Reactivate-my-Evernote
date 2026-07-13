import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar'
import { NoteList } from './components/NoteList'
import { NoteView } from './components/NoteView'
import { UploadPanel } from './components/UploadPanel'
import { clearAllNotes, getAllNotes, saveNotes } from './lib/db'
import type { Note } from './types'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  useEffect(() => {
    getAllNotes()
      .then((stored) => setNotes(stored))
      .finally(() => setIsLoading(false))
  }, [])

  const handleImported = (imported: Note[]) => {
    setNotes((prev) => {
      const byId = new Map(prev.map((n) => [n.id, n]))
      for (const note of imported) byId.set(note.id, note)
      return Array.from(byId.values())
    })
    void saveNotes(imported)
  }

  const handleClearAll = () => {
    if (!window.confirm('読み込んだすべての日記データをブラウザから削除します。よろしいですか?')) return
    void clearAllNotes()
    setNotes([])
    setSelectedNoteId(null)
  }

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes
      .filter((note) => (selectedTag ? note.tags.includes(selectedTag) : true))
      .filter((note) => {
        if (!q) return true
        return (
          note.title.toLowerCase().includes(q) ||
          note.plainText.toLowerCase().includes(q) ||
          note.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        const aDate = a.created ?? a.updated ?? ''
        const bDate = b.created ?? b.updated ?? ''
        return bDate.localeCompare(aDate)
      })
  }, [notes, query, selectedTag])

  const selectedNote = filteredNotes.find((n) => n.id === selectedNoteId) ?? null

  if (isLoading) {
    return <div className="loading-screen">読み込み中…</div>
  }

  if (notes.length === 0) {
    return (
      <div className="welcome-screen">
        <h1>📔 My Evernote Diary</h1>
        <p>
          Evernoteからエクスポートした <code>.enex</code> ファイルを読み込んで、
          <br />
          日記としてまた読めるようにします。データはこのブラウザ内だけで処理され、どこにも送信されません。
        </p>
        <UploadPanel onImported={handleImported} />
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar
        notes={notes}
        query={query}
        onQueryChange={setQuery}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        onImported={handleImported}
        onClearAll={handleClearAll}
      />
      <NoteList notes={filteredNotes} selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} />
      <NoteView note={selectedNote} />
    </div>
  )
}

export default App
