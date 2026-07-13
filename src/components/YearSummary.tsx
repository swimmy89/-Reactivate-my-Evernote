import type { LifeEvent, Note } from '../types'
import { getTopWords } from '../lib/wordFrequency'
import { buildYearReview } from '../lib/yearReview'

interface YearSummaryProps {
  year: number
  notes: Note[]
  lifeEvents: LifeEvent[]
}

export function YearSummary({ year, notes, lifeEvents }: YearSummaryProps) {
  const topWords = getTopWords(notes, 10)
  const maxCount = topWords[0]?.count ?? 1
  const review = buildYearReview(year, notes, lifeEvents)

  return (
    <div className="year-summary">
      <h2 className="year-summary-heading">📖 {year}年の振り返り</h2>
      <p className="year-review-text">{review}</p>
      {topWords.length > 0 && (
        <>
          <h3 className="year-summary-subheading">よく使った言葉</h3>
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
        </>
      )}
    </div>
  )
}
