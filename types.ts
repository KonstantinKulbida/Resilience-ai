export type AppLanguage = 'en' | 'ru';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR = 'HR'
}

export interface Question {
  id: number;
  text: string;
  category: 'exhaustion' | 'cynicism' | 'efficacy';
}

export interface AssessmentResult {
  date: string;
  exhaustionScore: number;
  cynicismScore: number;
  efficacyScore: number;
  overallRisk: 'Low' | 'Medium' | 'High';
}

export interface AIAnalysisResult {
  burnoutPercentage: number;
  metrics: {
    exhaustion: number; // Эмоциональное истощение (0-100)
    cynicism: number;   // Цинизм/Деперсонализация (0-100)
    inefficacy: number; // Ощущение непродуктивности (0-100)
  };
  productivityImpact: string;
  summary: string;
  recommendations: string[]; // Array of strings for bullet points
}

export interface ProgramModule {
  id: number;
  title: string;
  type: 'therapy' | 'somatic';
  duration: string;
  completed: boolean;
  description: string;
}

export interface HRMetric {
  name: string;
  value: number;
  delta: number; // percentage change
  positive: boolean;
}