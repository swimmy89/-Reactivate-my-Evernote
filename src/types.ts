export interface NoteResource {
  hash: string
  mime: string
  fileName: string
  /** base64-encoded binary data */
  dataBase64: string
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
