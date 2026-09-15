export type SustainabilityFactor =
  | 'workloadBalance'
  | 'recovery'
  | 'controlClarity';

export type SustainabilityStatus =
  | 'green'
  | 'stable'
  | 'needs_attention'
  | 'at_risk';

export interface AssessmentQuestionModel {
  id: number;
  factor: SustainabilityFactor;
  en: string;
  ru: string;
  reverse?: boolean;
}

export interface FactorResult {
  score: number;
  status: SustainabilityStatus;
}

export interface ResultAction {
  id: string;
  title: string;
  body: string;
}

export interface WorkSustainabilityResult {
  score: number;
  status: SustainabilityStatus;
  factors: Record<SustainabilityFactor, FactorResult>;
  weakestFactor: SustainabilityFactor;
  insight: string;
  actions: {
    today: ResultAction;
    week: ResultAction;
    support: ResultAction;
  };
  aiEnhanced: boolean;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestionModel[] = [
  {
    id: 1,
    factor: 'workloadBalance',
    en: 'My workload fits within the time and energy I realistically have.',
    ru: 'Моя рабочая нагрузка соответствует времени и энергии, которые у меня реально есть.',
  },
  {
    id: 2,
    factor: 'workloadBalance',
    en: 'I regularly need to extend my working day to keep up with my workload.',
    ru: 'Мне регулярно приходится удлинять рабочий день, чтобы справиться с нагрузкой.',
    reverse: true,
  },
  {
    id: 3,
    factor: 'workloadBalance',
    en: 'When too much work arrives, I can renegotiate priorities or deadlines.',
    ru: 'Когда задач становится слишком много, я могу пересогласовать приоритеты или сроки.',
  },
  {
    id: 4,
    factor: 'workloadBalance',
    en: 'Urgent requests and interruptions crowd out time for important work.',
    ru: 'Срочные запросы и переключения вытесняют время на действительно важную работу.',
    reverse: true,
  },
  {
    id: 5,
    factor: 'recovery',
    en: 'I get enough breaks during the workday to recover between periods of effort.',
    ru: 'В течение рабочего дня у меня есть достаточно пауз, чтобы восстановиться между периодами нагрузки.',
  },
  {
    id: 6,
    factor: 'recovery',
    en: 'Work pressure follows me into time when I am supposed to be off.',
    ru: 'Рабочее напряжение переносится на время, когда я уже не должен(на) работать.',
    reverse: true,
  },
  {
    id: 7,
    factor: 'recovery',
    en: 'I usually start the working day with enough energy for what is expected of me.',
    ru: 'Обычно я начинаю рабочий день с достаточным запасом энергии для того, что от меня ожидается.',
  },
  {
    id: 8,
    factor: 'recovery',
    en: 'After demanding periods, I have a real chance to recover before the next one.',
    ru: 'После напряжённых периодов у меня есть реальная возможность восстановиться до следующей нагрузки.',
  },
  {
    id: 9,
    factor: 'controlClarity',
    en: 'I know which priorities matter most in my work right now.',
    ru: 'Я понимаю, какие приоритеты сейчас самые важные в моей работе.',
  },
  {
    id: 10,
    factor: 'controlClarity',
    en: 'I often receive conflicting expectations without clarity on what should come first.',
    ru: 'Я часто сталкиваюсь с противоречивыми ожиданиями и не понимаю, что должно быть в приоритете.',
    reverse: true,
  },
  {
    id: 11,
    factor: 'controlClarity',
    en: 'I have enough control over how I organise and carry out my work.',
    ru: 'У меня достаточно контроля над тем, как организовать и выполнить свою работу.',
  },
  {
    id: 12,
    factor: 'controlClarity',
    en: 'When priorities conflict, I know how the decision about what comes first will be made.',
    ru: 'Если приоритеты конфликтуют, мне понятно, как будет принято решение о том, что важнее.',
  },
];
