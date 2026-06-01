import React from 'react';
import type { FunnelData } from '../../types';
import styles from './FunnelChart.module.scss';

interface Props {
  data: FunnelData[];
}

// React.memo — only re-renders when data actually changes
export const FunnelChart = React.memo(function FunnelChart({ data }: Props) {
  if (!data.length) {
    return <div className={styles.empty}>Add jobs to see your funnel</div>;
  }

  const max = data[0]?.count || 1;

  return (
    <div className={styles.funnel}>
      {data.map((item) => (
        <div key={item.stage} className={styles.step}>
          <div className={styles.stepLabel}>{item.stage}</div>
          <div className={styles.barWrap}>
            <div
              className={styles.barFill}
              style={{
                width: `${(item.count / max) * 100}%`,
                background: item.color,
              }}
            >
              {item.count > 0 && (
                <span className={styles.barCount}>{item.count}</span>
              )}
            </div>
          </div>
          <div className={styles.stepPct}>{item.percentage}%</div>
        </div>
      ))}
    </div>
  );
});