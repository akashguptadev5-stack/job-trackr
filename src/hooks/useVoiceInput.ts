import { useState, useRef, useCallback } from 'react';

interface UseVoiceInput {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  isSupported: boolean;
}

export function useVoiceInput(onResult: (text: string) => void): UseVoiceInput {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const isSupported = !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );

  const startRecording = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      setTranscript(final || interim);
      if (final) onResult(final);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend   = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isSupported, onResult]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setTranscript('');
  }, []);

  return { isRecording, transcript, startRecording, stopRecording, isSupported };
}