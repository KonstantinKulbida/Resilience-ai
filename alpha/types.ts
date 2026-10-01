import type { SustainabilityFactor, SustainabilityStatus } from '../assessmentModel';

export type AlphaLanguage = 'en' | 'ru';
export type AlphaAction = { id: string; title: string; body: string };
export type AlphaResult = {
  wave: 'baseline';
  score: number;
  status: SustainabilityStatus;
  factors: Record<SustainabilityFactor, { score: number; status: SustainabilityStatus }>;
  weakestFactor: SustainabilityFactor;
  weakestQuestionIds: number[];
  selectedActionIds: string[];
  submittedAt: string;
  insight: string;
  actions: { today: AlphaAction; week: AlphaAction; support: AlphaAction };
  aiEnhanced: false;
};
export type AlphaSession = {
  valid: boolean;
  department?: { slug: string; displayName: string };
  questionnaireVersion?: string;
  scoringVersion?: string;
  baselineSubmitted?: boolean;
  feedbackSubmitted?: boolean;
  result?: AlphaResult;
};