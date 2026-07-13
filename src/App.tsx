import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar'
import { NoteList } from './components/NoteList'
import { NoteView } from './components/NoteView'
import { UploadPanel } from './components/UploadPanel'
import { YearTimeline } from './components/YearTimeline'
import { clearAllNotes, getAllNotes, saveNotes } from './lib/db'
import type { Note } from './types'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
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
        if (selectedYear === null) return true
        const iso = note.created ?? note.updated
        return iso ? new Date(iso).getFullYear() === selectedYear : false
      })
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
        // While searching by keyword, show results oldest-first so it reads as
        // a timeline of how the theme was written about over the years,
        // rather than the usual newest-first browsing order.
        return q ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
      })
  }, [notes, query, selectedTag, selectedYear])

  const isSearching = query.trim() !== ''

  const selectedNote = filteredNotes.find((n) => n.id === selectedNoteId) ?? null

  const handleRandomNote = () => {
    if (filteredNotes.length === 0) return
    const note = filteredNotes[Math.floor(Math.random() * filteredNotes.length)]
    setSelectedNoteId(note.id)
  }

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
      <YearTimeline notes={notes} selectedYear={selectedYear} onSelectYear={setSelectedYear} />
      <Sidebar
        notes={notes}
        query={query}
        onQueryChange={setQuery}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        onImported={handleImported}
        onClearAll={handleClearAll}
        onRandomNote={handleRandomNote}
      />
      <NoteList
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        groupByYear={isSearching}
      />
      <NoteView note={selectedNote} allNotes={notes} selectedYear={selectedYear} onSelectNote={setSelectedNoteId} />
    </div>
  )
}

export default App
