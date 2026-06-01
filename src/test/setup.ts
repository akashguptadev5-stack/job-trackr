import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SCSS modules — Vitest doesn't process CSS
vi.mock('*.module.scss', () => ({ default: new Proxy({}, { get: (_t, prop) => prop }) }));
vi.mock('*.module.css',  () => ({ default: new Proxy({}, { get: (_t, prop) => prop }) }));

// Mock Supabase — never hit real DB in tests
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword:vi.fn(),
      signUp:            vi.fn(),
      signOut:           vi.fn(),
      getUser:           vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn().mockReturnValue({
      select:  vi.fn().mockReturnThis(),
      insert:  vi.fn().mockReturnThis(),
      update:  vi.fn().mockReturnThis(),
      delete:  vi.fn().mockReturnThis(),
      eq:      vi.fn().mockReturnThis(),
      order:   vi.fn().mockReturnThis(),
      single:  vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});