import DOMPurify from 'dompurify'
import type { NoteResource } from '../../types'

const VOID_ELEMENTS = new Set(['br', 'hr', 'img', 'input', 'area', 'col', 'embed', 'source', 'track', 'wbr'])

export interface EnmlConversionResult {
  html: string
  plainText: string
}

/** Converts Evernote's ENML (<en-note>...</en-note>) into sanitized, displayable HTML. */
export function enmlToHtml(enml: string, resources: NoteResource[]): EnmlConversionResult {
  const resourceByHash = new Map(resources.map((r) => [r.hash, r]))

  let doc: Document
  try {
    doc = new DOMParser().parseFromString(enml, 'text/xml')
  } catch {
    return fallbackToPlainText(enml)
  }

  const root = doc.documentElement
  if (!root || doc.getElementsByTagName('parsererror').length > 0) {
    return fallbackToPlainText(enml)
  }

  const parts: string[] = []
  walk(root, parts, resourceByHash)
  const rawHtml = parts.join('')

  const html = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['input'],
    ADD_ATTR: ['checked', 'disabled', 'download'],
  })
  const plainText = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return { html, plainText }
}

function fallbackToPlainText(enml: string): EnmlConversionResult {
  const text = enml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return { html: `<p>${escapeHtml(text)}</p>`, plainText: text }
}

function walk(node: Node, out: string[], resourceByHash: Map<string, NoteResource>) {
  for (const child of Array.from(node.childNodes)) {
    appendNode(child, out, resourceByHash)
  }
}

function appendNode(node: Node, out: string[], resourceByHash: Map<string, NoteResource>) {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(escapeHtml(node.textContent ?? ''))
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  if (tag === 'en-note') {
    out.push('<div class="enex-note">')
    walk(el, out, resourceByHash)
    out.push('</div>')
    return
  }

  if (tag === 'en-media') {
    appendMedia(el, out, resourceByHash)
    return
  }

  if (tag === 'en-todo') {
    const checked = el.getAttribute('checked') === 'true'
    out.push(`<input type="checkbox" disabled ${checked ? 'checked' : ''} />`)
    return
  }

  if (tag === 'en-crypt') {
    out.push('<span class="enex-encrypted">🔒 暗号化されたセクション(自動復号は未対応です)</span>')
    return
  }

  const attrs = Array.from(el.attributes)
    .map((a) => `${a.name}="${escapeHtml(a.value)}"`)
    .join(' ')
  const attrSuffix = attrs ? ` ${attrs}` : ''

  if (VOID_ELEMENTS.has(tag)) {
    out.push(`<${tag}${attrSuffix} />`)
    return
  }

  out.push(`<${tag}${attrSuffix}>`)
  walk(el, out, resourceByHash)
  out.push(`</${tag}>`)
}

function appendMedia(el: Element, out: string[], resourceByHash: Map<string, NoteResource>) {
  const hash = el.getAttribute('hash') ?? ''
  const type = el.getAttribute('type') ?? ''
  const resource = resourceByHash.get(hash)

  if (!resource) {
    out.push('<span class="enex-missing-resource">[添付ファイルが見つかりません]</span>')
    return
  }

  const dataUri = `data:${resource.mime};base64,${resource.dataBase64}`
  if (type.startsWith('image/')) {
    out.push(`<img src="${dataUri}" alt="${escapeHtml(resource.fileName)}" class="enex-image" />`)
  } else if (type.startsWith('audio/')) {
    out.push(`<audio controls src="${dataUri}"></audio>`)
  } else {
    out.push(
      `<a href="${dataUri}" download="${escapeHtml(resource.fileName)}" class="enex-attachment">📎 ${escapeHtml(resource.fileName)}</a>`,
    )
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
