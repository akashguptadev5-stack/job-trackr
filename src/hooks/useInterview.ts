import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootState,AppDispatch } from '../store';
import { authFetch } from '../lib/authFetch';

import {
  startSetup,
  startSession,
  addMessage,
  setAiTyping,
  updateScores,
  advanceTopic,
  endSession,
  type Message,
} from '../store/interviewSlice';
import type { ScoreCard } from '../types';

export function useInterview() {
  const dispatch = useAppDispatch();

  // Explicit RootState type fixes 'state is unknown' error
  const state = useAppSelector((s: RootState) => s.interview);
  const abortRef = useRef<AbortController | null>(null);

  // ── Start a new session ────────────────────────
  const initSession = useCallback(async (
    jobTitle: string,
    company: string,
    jobDescription: string
  ) => {
    dispatch(startSetup({ jobTitle, company, jobDescription }));
    dispatch(startSession());
    await askClaude([], jobTitle, company, jobDescription, true);
  }, [dispatch]);

  // ── Core: call Claude API via backend ──────────
  const askClaude = async (
    history: Message[],
    jobTitle: string,
    company: string,
    jobDescription: string,
    isOpening: boolean,
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await authFetch(`${BASE_URL}/api/ai/interview`, {
        method: 'POST',
        body: JSON.stringify({ history, jobTitle, company, jobDescription, isOpening }),
        signal: abortRef.current.signal,
      });

      if (!response.body) throw new Error('No stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      // Add blank AI message first — we'll fill it token by token
      dispatch(addMessage({ role: 'ai', content: '' }));
      dispatch(setAiTyping(false));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const trimmed = line.slice(6).trim();
          if (!trimmed) continue;
          const parsed = JSON.parse(trimmed);
          if (parsed.token) accumulated += parsed.token;
        }
      }

      // Replace blank message with full accumulated content
      dispatch(addMessage({ role: 'ai', content: accumulated }));

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      dispatch(setAiTyping(false));
      dispatch(addMessage({
        role: 'ai',
        content: 'Sorry, connection error. Please check your backend server is running.',
      }));
    }
  };

  // ── Send user answer → get AI follow-up ───────
  const sendAnswer = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    dispatch(addMessage({ role: 'user', content: userText }));
    dispatch(setAiTyping(true));
    dispatch(advanceTopic());

    const history = [...state.messages, {
      id: 'temp',
      role: 'user' as const,
      content: userText,
      timestamp: '',
    }];

    await askClaude(
      history,
      state.jobTitle,
      state.company,
      state.jobDescription,
      false
    );

    // Update live scores after each answer
    dispatch(updateScores({
      communication:  Math.min(10, (state.liveScores.communication  || 5) + (Math.random() * 1.5 | 0)),
      technicalDepth: Math.min(10, (state.liveScores.technicalDepth || 5) + (Math.random() * 1.2 | 0)),
      starFormat:     Math.min(10, (state.liveScores.starFormat     || 4) + (Math.random() * 1   | 0)),
      confidence:     Math.min(10, (state.liveScores.confidence     || 6) + (Math.random() * 0.8 | 0)),
    }));

    // End session when all questions done
    if (state.questionCount >= state.totalQuestions - 1) {
      dispatch(endSession());
    }
  }, [dispatch, state]);

  // ── Build final scorecard ──────────────────────
  const getScoreCard = useCallback((): ScoreCard => {
    const scores = state.liveScores;
    const overall = Math.round(
      (scores.communication + scores.technicalDepth + scores.starFormat + scores.confidence) / 4
    );
    return {
      ...scores,
      overall,
      feedback: overall >= 8
        ? 'Excellent performance — strong technical answers with clear communication.'
        : overall >= 6
        ? 'Good performance — work on structuring answers using the STAR method.'
        : 'Keep practising — focus on providing concrete examples from your experience.',
      strengths:     ['Strong React knowledge', 'Clear communication', 'Good use of examples'],
      improvements:  ['Use STAR format more consistently', 'Mention metrics in answers'],
    };
  }, [state.liveScores]);

  return { state, initSession, sendAnswer, getScoreCard };
}