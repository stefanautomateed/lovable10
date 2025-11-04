import { Blueprint, GeneratedFile } from './schemas';

const SESSION_KEY = 'ai-code-platform-session';

export interface SessionState {
  blueprint?: Blueprint;
  files: GeneratedFile[];
  prompt?: string;
  timestamp: number;
}

export function saveSession(state: SessionState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession(): SessionState | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    return JSON.parse(data) as SessionState;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}
