import React from 'react';
import type { SalaryData } from '../../lib/adzunaService';
import styles from './SalaryInsights.module.scss';

interface Props {
  data: (SalaryData | null)[];
  isLoading: boolean;
}

export const SalaryInsights = React.memo(function SalaryInsights({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.shimmer} />
        <div className={styles.shimmer} />
        <div className={styles.shimmer} />
      </div>
    );
  }

  const validData = data.filter(Boolean) as SalaryData[];

  if (!validData.length) {
    return (
      <div className={styles.empty}>
        Salary data unavailable — check your Adzuna API keys
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {validData.map(item => (
        <div key={item.role} className={styles.row}>
          <div className={styles.roleInfo}>
            <div className={styles.role}>{item.role}</div>
            <div className={styles.meta}>
              {item.location} · {item.count} listings
            </div>
          </div>
          <div className={styles.salaryInfo}>
            <div className={styles.range}>
              ₹{item.min}L – ₹{item.max}L
            </div>
            <div className={styles.avg}>avg ₹{item.avg}L</div>
          </div>
        </div>
      ))}
      <div className={styles.source}>
        💡 Live data from Adzuna API
      </div>
    </div>
  );
});