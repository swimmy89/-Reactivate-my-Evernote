import type { Note } from '../types'
import { getTopWords } from '../lib/wordFrequency'

interface YearSummaryProps {
  year: number
  notes: Note[]
}

export function YearSummary({ year, notes }: YearSummaryProps) {
  const topWords = getTopWords(notes, 10)
  const maxCount = topWords[0]?.count ?? 1

  return (
    <div className="year-summary">
      <h2 className="year-summary-heading">📊 {year}年によく使った言葉</h2>
      <p className="year-summary-meta">{notes.length}件の日記から集計</p>
      {topWords.length === 0 ? (
        <p className="on-this-day-empty">分析できる言葉が見つかりませんでした。</p>
      ) : (
        <ol className="word-rank-list">
          {topWords.map(({ word, count }, index) => (
            <li key={word} className="word-rank-item">
              <span className="word-rank-index">{index + 1}</span>
              <span className="word-rank-word">{word}</span>
              <span className="word-rank-bar-track">
                <span className="word-rank-bar" style={{ width: `${(count / maxCount) * 100}%` }} />
              </span>
              <span className="word-rank-count">{count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
