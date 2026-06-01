import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../../hooks/useVoiceInput';

describe('useVoiceInput', () => {
  it('reports unsupported when SpeechRecognition not available', () => {
    // Ensure neither SpeechRecognition nor webkitSpeechRecognition exist
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    const { result } = renderHook(() => useVoiceInput(vi.fn()));
    expect(result.current.isSupported).toBe(false);
  });

  it('starts with isRecording false', () => {
    const { result } = renderHook(() => useVoiceInput(vi.fn()));
    expect(result.current.isRecording).toBe(false);
  });

  it('does not crash startRecording when unsupported', () => {
    const { result } = renderHook(() => useVoiceInput(vi.fn()));
    expect(() => act(() => result.current.startRecording())).not.toThrow();
  });

  it('reports supported when SpeechRecognition available', () => {
    (window as any).SpeechRecognition = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      onresult: null,
      onerror: null,
      onend: null,
    }));

    const { result } = renderHook(() => useVoiceInput(vi.fn()));
    expect(result.current.isSupported).toBe(true);

    delete (window as any).SpeechRecognition;
  });
});