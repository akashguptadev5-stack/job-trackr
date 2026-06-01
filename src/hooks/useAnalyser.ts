import { useState, useRef } from 'react';
import { authFetch } from '../lib/authFetch';
import type { AnalysisResult, AnalysePayload } from '../../../job-trackr-api/src/types';

type Phase = 'idle' | 'streaming' | 'done' | 'error';

export function useAnalyser() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [streamText, setStreamText] = useState('');     // raw tokens as they arrive
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null); // lets us cancel the stream

  const analyse = async ({ resumeText, jobDescription }: AnalysePayload) => {
    // Cancel any existing stream
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setPhase('streaming');
    setStreamText('');
    setResult(null);
    setError('');

    let accumulated = '';

    try {
      const response = await authFetch('http://localhost:3001/api/ai/analyse', {
        method: 'POST',
        body: JSON.stringify({ resumeText, jobDescription }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Server error');
      if (!response.body) throw new Error('No response body');

      // ReadableStream — read SSE chunks as they arrive
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const json = line.slice(6).trim();
          if (!json) continue;

          const parsed = JSON.parse(json);

          if (parsed.error) {
            setError(parsed.error);
            setPhase('error');
            return;
          }

          if (parsed.done) {
            try {
              // Strip markdown code fences if AI wraps response in ```json ... ```
              const cleaned = accumulated
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim();

              // Find the JSON object in case there's any leading/trailing text
              const jsonStart = cleaned.indexOf('{');
              const jsonEnd = cleaned.lastIndexOf('}');

              if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('No JSON object found in response');
              }

              const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);
              const analysisResult = JSON.parse(jsonString) as AnalysisResult;
              setResult(analysisResult);
              setPhase('done');
            } catch (e) {
              console.error('Parse error:', e, 'Raw response:', accumulated);
              setError('Failed to parse AI response — check console for details');
              setPhase('error');
            }
            return;
          }

          if (parsed.token) {
            accumulated += parsed.token;
            // Show partial text while streaming
            setStreamText(accumulated);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Something went wrong');
      setPhase('error');
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setPhase('idle');
    setStreamText('');
    setResult(null);
    setError('');
  };

  return { analyse, phase, streamText, result, error, reset };
}