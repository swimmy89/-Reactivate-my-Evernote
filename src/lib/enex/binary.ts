import SparkMD5 from 'spark-md5'

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.replace(/\s+/g, ''))
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/** Evernote's <en-media hash="..."> refers to the MD5 hash of the decoded resource bytes. */
export function md5OfBase64(base64: string): string {
  return SparkMD5.ArrayBuffer.hash(base64ToArrayBuffer(base64))
}
