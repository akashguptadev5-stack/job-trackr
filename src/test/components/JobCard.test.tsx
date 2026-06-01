import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from '../../components/ui/JobCard';
import type { Job } from '../../types';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: vi.fn().mockReturnValue('') } },
}));

const mockJob: Job = {
  id: 'job-1',
  user_id: 'user-1',
  company: 'Google',
  role: 'Senior Frontend Engineer',
  location: 'Remote',
  status: 'applied',
  ai_match_score: 85,
  salary_min: 24,
  salary_max: 42,
  applied_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('JobCard', () => {
  it('renders company and role', () => {
    render(<JobCard job={mockJob} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
  });

  it('renders AI match score', () => {
    render(<JobCard job={mockJob} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<JobCard job={mockJob} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Edit job'));
    expect(onEdit).toHaveBeenCalledWith(mockJob);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<JobCard job={mockJob} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText('Delete job'));
    expect(onDelete).toHaveBeenCalledWith('job-1');
  });

  it('renders location tag', () => {
    render(<JobCard job={mockJob} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('shows Today for jobs applied today', () => {
    render(<JobCard job={mockJob} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});