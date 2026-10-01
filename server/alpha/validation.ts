import type { AlphaLanguage } from '../../alpha/types';
export const parseLanguage = (value: unknown): AlphaLanguage => value === 'ru' ? 'ru' : 'en';
export const isValidAssessmentAnswers = (value: unknown): value is Record<string, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  const keys = Object.keys(answers).sort((a,b)=>Number(a)-Number(b));
  if (keys.length !== 12 || keys.some((key, index) => key !== String(index + 1))) return false;
  return keys.every((key) => Number.isInteger(answers[key]) && Number(answers[key]) >= 1 && Number(answers[key]) <= 5);
};
export const isValidFeedback = (wave: unknown, rating: unknown, tag: unknown) =>
  wave === 'baseline' && Number.isInteger(rating) && Number(rating) >= 1 && Number(rating) <= 5 &&
  (tag === undefined || tag === null || (typeof tag === 'string' && tag.length <= 80));