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
  aiEnhanced: boolean;
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

export type AlphaManagerRole = 'department_manager' | 'org_admin';
export type AlphaManagerDepartment =
  | {
      slug: string;
      displayName: string;
      ready: false;
    }
  | {
      slug: string;
      displayName: string;
      ready: true;
      n: number;
      overallScore: number;
      status: SustainabilityStatus;
      factors: Record<SustainabilityFactor, { score: number; status: SustainabilityStatus }>;
      weakestFactor: SustainabilityFactor;
    };

export type AlphaManagerSession = {
  valid: boolean;
  role?: AlphaManagerRole;
  organization?: { slug: string; displayName: string };
  departmentScope?: { slug: string; displayName: string } | null;
  departments?: AlphaManagerDepartment[];
};
