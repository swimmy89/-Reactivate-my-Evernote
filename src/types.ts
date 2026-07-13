export interface NoteResource {
  hash: string
  mime: string
  fileName: string
  /** decoded binary data, stored directly so it isn't duplicated as base64 text */
  blob: Blob
}

export interface Note {
  /** stable id derived from title+created+source file */
  id: string
  title: string
  /** raw ENML content (<en-note>...</en-note>) */
  contentEnml: string
  /** sanitized HTML ready for display, resources resolved */
  contentHtml: string
  /** plain text extracted from content, used for full-text search */
  plainText: string
  created: string | null
  updated: string | null
  tags: string[]
  sourceNotebook: string
  sourceFile: string
  resources: NoteResource[]
  latitude?: number
  longitude?: number
}
