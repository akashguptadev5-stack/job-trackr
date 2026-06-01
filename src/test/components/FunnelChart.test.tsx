import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FunnelChart } from '../../components/ui/FunnelChart';
import type { FunnelData } from '../../types';

const mockData: FunnelData[] = [
  { stage: 'Applied',   count: 24, percentage: 100, color: '#60a5fa' },
  { stage: 'Interview', count: 8,  percentage: 33,  color: '#a78bfa' },
  { stage: 'Offer',     count: 2,  percentage: 8,   color: '#34d399' },
];

describe('FunnelChart', () => {
  it('renders all stages', () => {
    render(<FunnelChart data={mockData} />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Offer')).toBeInTheDocument();
  });

  it('renders correct counts', () => {
    render(<FunnelChart data={mockData} />);
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders correct percentages', () => {
    render(<FunnelChart data={mockData} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<FunnelChart data={[]} />);
    expect(screen.getByText('Add jobs to see your funnel')).toBeInTheDocument();
  });
});