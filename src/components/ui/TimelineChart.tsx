import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { WeeklyData } from '../../types';

interface Props {
  data: WeeklyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f1320',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// React.memo — expensive chart only re-renders when data changes
export const TimelineChart = React.memo(function TimelineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="week"
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="applications"
          name="Applications"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#appGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="responses"
          name="Responses"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#resGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});