import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
// TypeScript types for our state shape
export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
}

export interface LiveScores {
  communication: number;
  technicalDepth: number;
  starFormat: number;
  confidence: number;
}

export type Topic = {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
};

export type SessionStatus = 'idle' | 'setup' | 'active' | 'complete';

interface InterviewState {
  status: SessionStatus;
  jobTitle: string;
  company: string;
  jobDescription: string;
  messages: Message[];
  liveScores: LiveScores;
  topics: Topic[];
  questionCount: number;
  totalQuestions: number;
  isAiTyping: boolean;
}

const DEFAULT_TOPICS: Topic[] = [
  { id: '1', label: 'Intro & background',  status: 'pending' },
  { id: '2', label: 'React experience',    status: 'pending' },
  { id: '3', label: 'Redux / Flux',        status: 'pending' },
  { id: '4', label: 'Performance opt.',    status: 'pending' },
  { id: '5', label: 'System design',       status: 'pending' },
];

const initialState: InterviewState = {
  status: 'idle',
  jobTitle: '',
  company: '',
  jobDescription: '',
  messages: [],
  liveScores: { communication: 0, technicalDepth: 0, starFormat: 0, confidence: 0 },
  topics: DEFAULT_TOPICS,
  questionCount: 0,
  totalQuestions: 5,
  isAiTyping: false,
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // Start setup flow
    startSetup(state, action: PayloadAction<{ jobTitle: string; company: string; jobDescription: string }>) {
      state.status = 'setup';
      state.jobTitle = action.payload.jobTitle;
      state.company = action.payload.company;
      state.jobDescription = action.payload.jobDescription;
    },

    // Session goes live
    startSession(state) {
      state.status = 'active';
      state.messages = [];
      state.questionCount = 0;
      state.topics = DEFAULT_TOPICS.map((t, i) => ({
        ...t,
        status: i === 0 ? 'active' : 'pending',
      }));
    },

    // Add any message (AI or user)
    addMessage(state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) {
      state.messages.push({
        ...action.payload,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    },

    // Show/hide AI typing indicator
    setAiTyping(state, action: PayloadAction<boolean>) {
      state.isAiTyping = action.payload;
    },

    // Update live scores after each answer
    updateScores(state, action: PayloadAction<Partial<LiveScores>>) {
      state.liveScores = { ...state.liveScores, ...action.payload };
    },

    // Advance topic progress
    advanceTopic(state) {
      state.questionCount += 1;
      const activeIdx = state.topics.findIndex(t => t.status === 'active');
      if (activeIdx !== -1) {
        state.topics[activeIdx].status = 'done';
        if (activeIdx + 1 < state.topics.length) {
          state.topics[activeIdx + 1].status = 'active';
        }
      }
    },

    // End the session
    endSession(state) {
      state.status = 'complete';
    },

    // Full reset
    resetInterview() {
      return initialState;
    },
  },
});

export const {
  startSetup, startSession, addMessage, setAiTyping,
  updateScores, advanceTopic, endSession, resetInterview,
} = interviewSlice.actions;

export const interviewReducer = interviewSlice.reducer;