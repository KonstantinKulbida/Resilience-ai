import type { AlphaLanguage, AlphaResult, AlphaSession } from '../alpha/types';
const post = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'alpha_service_unavailable');
  return data as T;
};
export const getAlphaSession = (token: string, language: AlphaLanguage) => post<AlphaSession>('/api/alpha/session', { token, language });
export const submitAlphaAssessment = (token: string, answers: Record<string, number>, language: AlphaLanguage) =>
  post<{ alreadySubmitted: boolean; result: AlphaResult }>('/api/alpha/assessment', { token, answers, language });
export const submitAlphaFeedback = (token: string, usefulnessRating: number, usefulnessTag?: string) =>
  post<{ feedbackSubmitted: boolean }>('/api/alpha/feedback', { token, wave: 'baseline', usefulnessRating, usefulnessTag });