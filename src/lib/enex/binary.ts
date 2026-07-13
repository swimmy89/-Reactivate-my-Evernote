import SparkMD5 from 'spark-md5'

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64.replace(/\s+/g, ''))
  const len = binary.length
  const bytes = new Uint8Array(new ArrayBuffer(len))
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Decodes a resource's base64 payload exactly once, producing both its
 * Evernote hash (MD5 of the decoded bytes) and a Blob for storage/display.
 * Keeping this to a single decode avoids piling up multiple in-memory
 * copies of large attachments (base64 string + ArrayBuffer + data URI),
 * which is what was blowing past Safari's per-tab memory limit on iOS.
 */
export function decodeResource(base64: string, mime: string): { hash: string; blob: Blob } {
  const bytes = base64ToBytes(base64)
  const hash = SparkMD5.ArrayBuffer.hash(bytes.buffer as ArrayBuffer)
  const blob = new Blob([bytes], { type: mime })
  return { hash, blob }
}
