import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Note } from '../types'

interface DiaryDB extends DBSchema {
  notes: {
    key: string
    value: Note
    indexes: { 'by-created': string }
  }
}

const DB_NAME = 'evernote-diary'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<DiaryDB>> | null = null

function getDb(): Promise<IDBPDatabase<DiaryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DiaryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('notes', { keyPath: 'id' })
        store.createIndex('by-created', 'created')
      },
    })
  }
  return dbPromise
}

/** Upserts notes by id, so re-importing the same export is idempotent. */
export async function saveNotes(notes: Note[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('notes', 'readwrite')
  await Promise.all(notes.map((note) => tx.store.put(note)))
  await tx.done
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDb()
  return db.getAll('notes')
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('notes', id)
}

export async function clearAllNotes(): Promise<void> {
  const db = await getDb()
  await db.clear('notes')
}
