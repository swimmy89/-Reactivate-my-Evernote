import { useCallback, useRef, useState } from 'react'
import { parseEnexFile } from '../lib/enex/parseEnex'
import type { Note } from '../types'

interface UploadPanelProps {
  onImported: (notes: Note[]) => void
  compact?: boolean
}

export function UploadPanel({ onImported, compact = false }: UploadPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      const files = Array.from(fileList).filter((f) => f.name.toLowerCase().endsWith('.enex'))
      if (files.length === 0) {
        setError('.enex ファイルを選択してください')
        return
      }

      setIsBusy(true)
      setError(null)
      let total = 0
      try {
        for (const file of files) {
          setStatus(`読み込み中: ${file.name}`)
          // Notes are handed off (and saved) one at a time rather than collected
          // into one big array, so peak memory stays bounded even for large,
          // photo-heavy exports on memory-constrained devices.
          await parseEnexFile(file, (note) => {
            onImported([note])
            total++
          })
        }
        setStatus(`${total}件のノートを読み込みました`)
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました')
      } finally {
        setIsBusy(false)
      }
    },
    [onImported],
  )

  return (
    <div
      className={`upload-panel ${isDragOver ? 'is-dragover' : ''} ${compact ? 'is-compact' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        void handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".enex"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <button type="button" className="upload-button" onClick={() => inputRef.current?.click()} disabled={isBusy}>
        {isBusy ? '読み込み中…' : '.enex ファイルを選択'}
      </button>
      {!compact && <p className="upload-hint">またはここにファイルをドラッグ&ドロップ</p>}
      {status && !error && <p className="upload-status">{status}</p>}
      {error && <p className="upload-error">{error}</p>}
    </div>
  )
}
