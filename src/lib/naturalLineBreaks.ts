const BREAK_AFTER = /([。!?！?…]+[」』)）]?| +)/g

const SKIP_TAGS = new Set(['img', 'audio', 'br', 'a', 'input'])

/**
 * Returns a new HTML string with a line break inserted after each sentence
 * ending (。！？ etc.) and after each run of half-width spaces — old diary
 * entries often used a plain space as a manual line-break marker instead of
 * punctuation. Only text nodes are touched — no characters are added,
 * removed, or reordered (the space itself is kept, a break is just added
 * after it), and existing tags/attributes (including the resource
 * placeholders NoteView resolves) are left exactly as they are. This runs
 * entirely in the browser; nothing is sent anywhere.
 */
export function withNaturalLineBreaks(html: string): string {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return html
  insertBreaks(root)
  return root.innerHTML
}

function insertBreaks(node: Node) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      splitTextNode(child as Text)
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = (child as Element).tagName.toLowerCase()
      if (SKIP_TAGS.has(tag)) continue
      insertBreaks(child)
    }
  }
}

function splitTextNode(textNode: Text) {
  const parts = textNode.data.split(BREAK_AFTER).filter((part) => part !== '')
  if (parts.length <= 1) return

  const frag = document.createDocumentFragment()
  for (let i = 0; i < parts.length; i += 2) {
    const body = parts[i] ?? ''
    const delimiter = parts[i + 1] ?? ''
    frag.appendChild(document.createTextNode(body + delimiter))
    const isLast = i + 2 >= parts.length
    if (delimiter && !isLast) {
      frag.appendChild(document.createElement('br'))
    }
  }
  textNode.replaceWith(frag)
}
