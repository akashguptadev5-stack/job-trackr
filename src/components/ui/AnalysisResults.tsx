import { useState } from 'react';
import type { AnalysisResult } from '../../types';
import styles from './AnalysisResults.module.scss';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: Props) {
  const [activeBullet, setActiveBullet] = useState(0);

  const scoreColor =
    result.matchScore >= 80 ? '#34d399' :
    result.matchScore >= 60 ? '#a78bfa' : '#f87171';

  // SVG circle progress — circumference of r=32 circle = ~201
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (result.matchScore / 100) * circumference;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analysis complete</h1>
          <p className={styles.sub}>Review your match score, missing keywords and rewritten bullets</p>
        </div>
        <button className={styles.resetBtn} onClick={onReset}>
          Analyse another →
        </button>
      </div>

      {/* Score ring */}
      <div className={styles.scoreCard}>
        <div className={styles.ring}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="32" fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="45" cy="45" r="32" fill="none"
              stroke={scoreColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '45px 45px', transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className={styles.ringInner}>
            <span className={styles.ringNum} style={{ color: scoreColor }}>
              {result.matchScore}
            </span>
            <span className={styles.ringLabel}>match</span>
          </div>
        </div>
        <div className={styles.scoreMeta}>
          <h2 className={styles.scoreTitle}>{result.matchSummary}</h2>
          <div className={styles.badgeRow}>
            {result.keywordsFound.slice(0, 5).map(k => (
              <span key={k} className={`${styles.badge} ${styles.found}`}>{k} ✓</span>
            ))}
            {result.keywordsMissing.slice(0, 3).map(k => (
              <span key={k} className={`${styles.badge} ${styles.missing}`}>{k} ✗</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Keywords found */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>✅ Keywords found ({result.keywordsFound.length})</div>
          <div className={styles.kwGrid}>
            {result.keywordsFound.map(k => (
              <span key={k} className={`${styles.kw} ${styles.kwFound}`}>{k}</span>
            ))}
          </div>
        </div>

        {/* Keywords missing */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>❌ Missing keywords ({result.keywordsMissing.length})</div>
          <div className={styles.kwGrid}>
            {result.keywordsMissing.map(k => (
              <span key={k} className={`${styles.kw} ${styles.kwMissing}`}>{k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Rewritten bullets */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>✍️ Rewritten bullets — optimised for this JD</div>
        <div className={styles.tabRow}>
          {result.rewrittenBullets.map((b, i) => (
            <button
              key={i}
              className={`${styles.tab} ${activeBullet === i ? styles.tabActive : ''}`}
              onClick={() => setActiveBullet(i)}
            >
              {b.section}
            </button>
          ))}
        </div>
        {result.rewrittenBullets[activeBullet] && (
          <div className={styles.rewriteBox}>
            <div className={styles.rewriteLabel}>Before</div>
            <p className={styles.rewriteOld}>
              {result.rewrittenBullets[activeBullet].original}
            </p>
            <div className={styles.rewriteLabel} style={{ color: '#34d399', marginTop: 10 }}>
              After — optimised for this JD
            </div>
            <p className={styles.rewriteNew}>
              {result.rewrittenBullets[activeBullet].rewritten}
            </p>
          </div>
        )}
      </div>

      {/* Action plan */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>💡 Action plan</div>
        {result.actionPlan.map((action, i) => (
          <div key={i} className={styles.actionItem}>
            <div className={styles.actionDot} />
            <p>{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}