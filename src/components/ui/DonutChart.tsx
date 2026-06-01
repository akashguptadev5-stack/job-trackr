import React, { useMemo } from 'react';
import styles from './DonutChart.module.scss';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataItem[];
}

export const DonutChart = React.memo(function DonutChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  // Calculate SVG arc segments
  const segments = useMemo(() => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return data.map(item => {
      const pct  = total ? item.value / total : 0;
      const dash = pct * circumference;
      const gap  = circumference - dash;
      const seg  = { ...item, dash, gap, offset, pct };
      offset += dash;
      return seg;
    });
  }, [data, total]);

  if (!total) {
    return <div className={styles.empty}>Add jobs to see breakdown</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.chart}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45" cy="45" r="32"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="45" cy="45" r="32"
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeLinecap="butt"
              strokeDasharray={`${seg.dash - 2} ${seg.gap + 2}`}
              strokeDashoffset={-seg.offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '45px 45px' }}
            />
          ))}
        </svg>
        <div className={styles.center}>
          <span className={styles.total}>{total}</span>
          <span className={styles.totalLabel}>total</span>
        </div>
      </div>

      <div className={styles.legend}>
        {data.map(item => (
          <div key={item.name} className={styles.legendItem}>
            <div className={styles.dot} style={{ background: item.color }} />
            <span className={styles.legendName}>{item.name}</span>
            <span className={styles.legendVal}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});