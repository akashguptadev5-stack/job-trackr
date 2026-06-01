import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// vi.mock must be at TOP LEVEL — not inside beforeEach
vi.mock('../../lib/authFetch', () => ({
  authFetch: vi.fn(),
}));

// Import AFTER mock is declared
import { useAnalyser } from '../../hooks/useAnalyser';
import { authFetch } from '../../lib/authFetch';

// Use globalThis instead of global — works in both browser and Node
const mockAuthFetch = vi.mocked(authFetch);

function makeStream(chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}

describe('useAnalyser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle phase', () => {
    const { result } = renderHook(() => useAnalyser());
    expect(result.current.phase).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('moves to streaming phase when analyse called', async () => {
    const mockResult = {
      matchScore: 85,
      matchSummary: 'Strong match',
      keywordsFound: ['React', 'TypeScript'],
      keywordsMissing: ['GraphQL'],
      rewrittenBullets: [],
      actionPlan: ['Add GraphQL experience'],
    };

    mockAuthFetch.mockResolvedValueOnce({
      ok: true,
      body: makeStream([
        `data: ${JSON.stringify({ token: JSON.stringify(mockResult) })}\n\n`,
        `data: ${JSON.stringify({ done: true })}\n\n`,
      ]),
    } as any);

    const { result } = renderHook(() => useAnalyser());

    await act(async () => {
      result.current.analyse({
        resumeText: 'My resume text',
        jobDescription: 'Job description text',
      });
    });

    expect(result.current.phase).toBe('streaming');
  });

  it('resets to idle on reset()', async () => {
    const { result } = renderHook(() => useAnalyser());

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.phase).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.streamText).toBe('');
  });
});