import { tinySegment } from './tinySegmenter'
import type { Note } from '../types'

// Particles, auxiliary verbs, and other function words/pronouns that are too
// common to say anything about a given year. TinySegmenter has no
// part-of-speech tags, so this list is a manually curated approximation.
const STOPWORDS = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる', 'も',
  'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる', 'など', 'なっ', 'ない', 'この',
  'ため', 'その', 'あっ', 'よう', 'また', 'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ',
  'か', 'だ', 'これ', 'によって', 'により', 'おり', 'より', 'による', 'ず', 'なり', 'られる',
  'において', 'ば', 'なかっ', 'なく', 'しかし', 'について', 'せ', 'だっ', 'その後', 'できる',
  'それ', 'う', 'ので', 'なお', 'のみ', 'でき', 'き', 'つ', 'における', 'および', 'いう', 'さらに',
  'でも', 'ら', 'たり', 'その他', 'たち', 'ます', 'ん', 'なら', '特に', 'せる', 'これら', 'とき',
  'では', 'にて', 'ほか', 'ながら', 'うち', 'そして', 'ただし', 'かつて', 'それぞれ', 'または',
  'お', 'ほど', 'ものの', 'ほとんど', 'といった', 'です', 'とも', 'ところ', 'ここ', 'どの', 'いく',
  'わけ', '私', '僕', '自分', 'あれ', 'どれ', '人', '今日', '今', '昨日', '明日', '思う', '思っ',
  'くれ', 'いた', 'いっ', 'でし', 'よかっ', 'られた', 'しまっ', 'できた', 'いい', 'なんか',
])

// Function words are almost always kana-only; requiring at least one
// kanji/katakana character biases the ranking toward the content nouns
// (友達, 仕事, 旅行, 育児, ...) the ranking is meant to surface. This means
// purely-hiragana content words get filtered out too, which is a real
// tradeoff — see PR notes.
const HAS_KANJI_OR_KATAKANA = /[一-龠々〆ヵヶァ-ヴー]/
const NUMERIC_OR_PUNCTUATION_ONLY = /^[0-9０-９、。,.!?！?「」『』…\s\-ー・]+$/

export interface WordCount {
  word: string
  count: number
}

/** Ranks the most frequent meaningful words across the given notes' text. */
export function getTopWords(notes: Note[], limit = 10): WordCount[] {
  const counts = new Map<string, number>()

  for (const note of notes) {
    for (const token of tinySegment(note.plainText)) {
      const word = token.trim()
      if (word.length < 2) continue
      if (STOPWORDS.has(word)) continue
      if (NUMERIC_OR_PUNCTUATION_ONLY.test(word)) continue
      if (!HAS_KANJI_OR_KATAKANA.test(word)) continue
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
