import { useAppDispatch } from '../../store/hooks';
import { resetInterview } from '../../store/interviewSlice';
import type { ScoreCard } from '../../types';
import styles from './ScoreCardView.module.scss';

interface Props {
  scoreCard: ScoreCard;
  jobTitle: string;
  company: string;
}

export function ScoreCardView({ scoreCard, jobTitle, company }: Props) {
  const dispatch = useAppDispatch();

  const scoreColor = (n: number) =>
    n >= 8 ? '#34d399' : n >= 6 ? '#a78bfa' : '#f87171';

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.trophy}>🏆</div>
          <h1 className={styles.title}>Interview complete</h1>
          <p className={styles.sub}>{jobTitle} · {company}</p>
        </div>

        <div className={styles.overall}>
          <div className={styles.overallNum} style={{ color: scoreColor(scoreCard.overall) }}>
            {scoreCard.overall}<span className={styles.outOf}>/10</span>
          </div>
          <div className={styles.overallLabel}>Overall score</div>
          <p className={styles.feedback}>{scoreCard.feedback}</p>
        </div>

        <div className={styles.breakdown}>
          {([
            ['Communication',   scoreCard.communication],
            ['Technical depth', scoreCard.technicalDepth],
            ['STAR format',     scoreCard.starFormat],
            ['Confidence',      scoreCard.confidence],
          ] as [string, number][]).map(([label, val]) => (
            <div key={label} className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>{label}</span>
              <div className={styles.breakdownBar}>
                <div
                  className={styles.breakdownFill}
                  style={{ width: `${val * 10}%`, background: scoreColor(val) }}
                />
              </div>
              <span className={styles.breakdownVal} style={{ color: scoreColor(val) }}>{val}/10</span>
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>💪 Strengths</div>
            {scoreCard.strengths.map((s, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.dot} style={{ background: '#34d399' }} />{s}
              </div>
            ))}
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>📈 Improve</div>
            {scoreCard.improvements.map((s, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.dot} style={{ background: '#fbbf24' }} />{s}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={() => dispatch(resetInterview())}>
            Practice again
          </button>
        </div>
      </div>
    </div>
  );
}