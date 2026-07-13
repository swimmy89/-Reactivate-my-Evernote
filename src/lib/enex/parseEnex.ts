import SparkMD5 from 'spark-md5'
import type { Note, NoteResource } from '../../types'
import { parseEvernoteDate } from './dateUtils'
import { md5OfBase64 } from './binary'
import { enmlToHtml } from './enmlToHtml'

export async function parseEnexFile(file: File): Promise<Note[]> {
  const xmlText = await file.text()
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')

  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error(`"${file.name}" は正しい .enex (XML) ファイルとして読み込めませんでした`)
  }

  const notebookName = file.name.replace(/\.enex$/i, '')
  const noteEls = Array.from(doc.getElementsByTagName('note'))

  return noteEls.map((noteEl) => parseNote(noteEl, file.name, notebookName))
}

function parseNote(noteEl: Element, sourceFile: string, sourceNotebook: string): Note {
  const title = textOf(noteEl, 'title') ?? '(無題)'
  const created = parseEvernoteDate(textOf(noteEl, 'created'))
  const updated = parseEvernoteDate(textOf(noteEl, 'updated'))
  const tags = Array.from(noteEl.getElementsByTagName('tag'))
    .map((t) => t.textContent?.trim() ?? '')
    .filter(Boolean)

  const contentEl = noteEl.getElementsByTagName('content')[0]
  const contentEnml = contentEl?.textContent ?? '<en-note></en-note>'

  const resources = parseResources(noteEl)
  const { html: contentHtml, plainText } = enmlToHtml(contentEnml, resources)

  const attrsEl = noteEl.getElementsByTagName('note-attributes')[0]
  const latitude = numberOf(attrsEl, 'latitude')
  const longitude = numberOf(attrsEl, 'longitude')

  const id = computeNoteId(sourceFile, title, created, contentEnml)

  return {
    id,
    title,
    contentEnml,
    contentHtml,
    plainText,
    created,
    updated,
    tags,
    sourceNotebook,
    sourceFile,
    resources,
    latitude,
    longitude,
  }
}

function parseResources(noteEl: Element): NoteResource[] {
  return Array.from(noteEl.getElementsByTagName('resource')).map((resEl) => {
    const dataEl = resEl.getElementsByTagName('data')[0]
    const dataBase64 = (dataEl?.textContent ?? '').replace(/\s+/g, '')
    const mime = textOf(resEl, 'mime') ?? 'application/octet-stream'
    const fileName = textOf(resEl, 'file-name') ?? 'attachment'
    const hash = dataBase64 ? md5OfBase64(dataBase64) : ''
    return { hash, mime, fileName, dataBase64 }
  })
}

function computeNoteId(sourceFile: string, title: string, created: string | null, contentEnml: string): string {
  return SparkMD5.hash(`${sourceFile}::${title}::${created ?? ''}::${contentEnml.length}`)
}

function textOf(parent: Element | undefined, tagName: string): string | null {
  const el = parent?.getElementsByTagName(tagName)[0]
  const text = el?.textContent?.trim()
  return text ? text : null
}

function numberOf(parent: Element | undefined, tagName: string): number | undefined {
  const text = textOf(parent, tagName)
  if (text === null) return undefined
  const n = Number(text)
  return Number.isFinite(n) ? n : undefined
}
