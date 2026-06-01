import { useAnalytics } from '../hooks/useAnalytics';
import { FunnelChart }    from '../components/ui/FunnelChart';
import { DonutChart }     from '../components/ui/DonutChart';
import { TimelineChart }  from '../components/ui/TimelineChart';
import { SalaryInsights } from '../components/ui/SalaryInsights';
import styles from './AnalyticsPage.module.scss';

export function AnalyticsPage() {
  const {
    stats,
    funnelData,
    weeklyData,
    statusBreakdown,
    insights,
    salaryComparison,
    salaryLoading,
    roleFilter,
    setRoleFilter,
  } = useAnalytics();

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.sub}>Your job search performance at a glance</p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statVal}>{stats.totalApplications}</div>
          <div className={styles.statLabel}>Applications</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{stats.responseRate}%</div>
          <div className={styles.statLabel}>Response rate</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{stats.interviewRate}%</div>
          <div className={styles.statLabel}>Interview rate</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{stats.avgMatchScore || '—'}%</div>
          <div className={styles.statLabel}>Avg AI match</div>
        </div>
      </div>

      {/* ── Timeline + Donut ── */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Application timeline</div>
          <TimelineChart data={weeklyData} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Status breakdown</div>
          <DonutChart data={statusBreakdown} />
        </div>
      </div>

      {/* ── Funnel ── */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Application funnel — conversion rates</div>
        <FunnelChart data={funnelData} />
      </div>

      {/* ── Salary + Insights ── */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            💰 Live salary data
            <input
              className={styles.roleInput}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              placeholder="Search role..."
            />
          </div>
          <SalaryInsights
            data={salaryComparison || []}
            isLoading={salaryLoading}
          />
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>🤖 AI insights</div>
          <div className={styles.insights}>
            {insights.map((insight:any, i:any) => (
              <div key={i} className={styles.insightCard}>
                <div className={styles.insightDot} />
                <p className={styles.insightText}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}