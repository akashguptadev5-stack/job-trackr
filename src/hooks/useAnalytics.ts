import { useMemo, useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useJobs } from './useJobs';
import { fetchSalaryData } from '../lib/adzunaService';
import type { FunnelData, WeeklyData, AnalyticsStats } from '../types';

export function useAnalytics() {
  const { jobs } = useJobs();
  const [roleFilter, setRoleFilter] = useState('Senior Frontend Engineer');

  // useDeferredValue — filter updates don't block the UI
  // When user types fast, deferred value lags behind keeping UI smooth
  const deferredRole = useDeferredValue(roleFilter);

  // ── Compute funnel from real jobs data ─────────
  const funnelData = useMemo((): FunnelData[] => {
    const total      = jobs.length;
    const interviews = jobs.filter(j => j.status === 'interview' || j.status === 'offer').length;
    const offers     = jobs.filter(j => j.status === 'offer').length;
    const rejected   = jobs.filter(j => j.status === 'rejected').length;
    const replied    = interviews + offers + rejected;

    if (total === 0) return [];

    return [
      { stage: 'Applied',   count: total,      percentage: 100,                              color: '#60a5fa' },
      { stage: 'Replied',   count: replied,     percentage: Math.round(replied / total * 100),     color: '#818cf8' },
      { stage: 'Interview', count: interviews,  percentage: Math.round(interviews / total * 100),  color: '#a78bfa' },
      { stage: 'Offer',     count: offers,      percentage: Math.round(offers / total * 100),      color: '#34d399' },
    ];
  }, [jobs]);

  // ── Weekly application timeline ────────────────
  const weeklyData = useMemo((): WeeklyData[] => {
    const weeks: Record<string, WeeklyData> = {};

    jobs.forEach(job => {
      const date    = new Date(job.applied_at);
      const weekNum = Math.floor((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekKey = `Week ${Math.max(1, 8 - weekNum)}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, applications: 0, responses: 0, interviews: 0 };
      }
      weeks[weekKey].applications++;
      if (job.status !== 'applied') weeks[weekKey].responses++;
      if (job.status === 'interview' || job.status === 'offer') weeks[weekKey].interviews++;
    });

    // Always show 8 weeks even if empty
    return Array.from({ length: 8 }, (_, i) => {
      const key = `Week ${i + 1}`;
      return weeks[key] || { week: key, applications: 0, responses: 0, interviews: 0 };
    });
  }, [jobs]);

  // ── Status breakdown for donut chart ──────────
  const statusBreakdown = useMemo(() => [
    { name: 'Applied',   value: jobs.filter(j => j.status === 'applied').length,   color: '#60a5fa' },
    { name: 'Interview', value: jobs.filter(j => j.status === 'interview').length, color: '#a78bfa' },
    { name: 'Offer',     value: jobs.filter(j => j.status === 'offer').length,     color: '#34d399' },
    { name: 'Rejected',  value: jobs.filter(j => j.status === 'rejected').length,  color: '#f87171' },
  ], [jobs]);

  // ── Summary stats ──────────────────────────────
  const stats = useMemo((): AnalyticsStats => {
    const total      = jobs.length;
    const replied    = jobs.filter(j => j.status !== 'applied').length;
    const interviews = jobs.filter(j => j.status === 'interview' || j.status === 'offer').length;
    const offers     = jobs.filter(j => j.status === 'offer').length;
    const scored     = jobs.filter(j => j.ai_match_score);
    const avgMatch   = scored.length
      ? Math.round(scored.reduce((s, j) => s + (j.ai_match_score || 0), 0) / scored.length)
      : 0;

    return {
      totalApplications: total,
      responseRate:  total ? Math.round(replied    / total * 100) : 0,
      interviewRate: total ? Math.round(interviews / total * 100) : 0,
      offerRate:     total ? Math.round(offers     / total * 100) : 0,
      avgMatchScore: avgMatch,
      avgDaysToResponse: 4, // placeholder — Phase 6 makes this real
    };
  }, [jobs]);

  // ── AI insights generated from real data ───────
  const insights = useMemo(() => {
    const result: string[] = [];

    if (stats.responseRate > 20) {
      result.push(`Your response rate is ${stats.responseRate}% — above the industry average of 15%. Keep it up.`);
    } else if (stats.totalApplications > 0) {
      result.push(`Your response rate is ${stats.responseRate}%. Try improving AI match scores before applying.`);
    }

    if (stats.avgMatchScore > 75) {
      result.push(`High AI match scores (avg ${stats.avgMatchScore}%) correlate with your interview callbacks.`);
    } else if (stats.avgMatchScore > 0) {
      result.push(`Boost AI match scores above 80% — run the Resume Analyser before each application.`);
    }

    if (stats.totalApplications < 5) {
      result.push('Apply to more positions — aim for 5+ applications per week for best results.');
    }

    return result.length ? result : ['Add more jobs to see personalised insights.'];
  }, [stats]);

  // ── Live salary data from Adzuna ──────────────
  // Uses deferredRole so typing doesn't spam the API
  const { data: salaryData, isLoading: salaryLoading } = useQuery({
    queryKey: ['salary', deferredRole],
    queryFn: () => fetchSalaryData(deferredRole, 'india'),
    staleTime: 1000 * 60 * 30, // cache for 30 minutes
    retry: 1,
  });

  // Multiple role salary comparison
  const { data: salaryComparison } = useQuery({
    queryKey: ['salaryComparison'],
    queryFn: async () => {
      const roles = [
        'Senior Frontend Engineer',
        'React Developer',
        'Frontend Architect',
      ];
      const results = await Promise.all(
        roles.map(r => fetchSalaryData(r, 'india').catch(() => null))
      );
      return results.filter(Boolean);
    },
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });

  return {
    stats,
    funnelData,
    weeklyData,
    statusBreakdown,
    insights,
    salaryData,
    salaryComparison,
    salaryLoading,
    roleFilter,
    setRoleFilter,
    deferredRole,
  };
}