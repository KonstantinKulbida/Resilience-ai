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
    en: 'My workload is manageable within the time available.',
    ru: 'Моя рабочая нагрузка выполнима в доступное мне время.',
  },
  {
    id: 2,
    factor: 'workloadBalance',
    en: 'I regularly have more work than I can reasonably complete.',
    ru: 'У меня регулярно больше работы, чем я реально могу выполнить.',
    reverse: true,
  },
  {
    id: 3,
    factor: 'workloadBalance',
    en: 'I have enough capacity to absorb unexpected work without everything else slipping.',
    ru: 'У меня достаточно запаса, чтобы справиться с неожиданной работой без срыва остальных задач.',
  },
  {
    id: 4,
    factor: 'workloadBalance',
    en: 'I often need to rush, work late, or skip breaks to keep up.',
    ru: 'Чтобы всё успеть, мне часто приходится спешить, работать допоздна или пропускать перерывы.',
    reverse: true,
  },
  {
    id: 5,
    factor: 'recovery',
    en: 'I start most workdays with enough energy for what is ahead.',
    ru: 'Большинство рабочих дней я начинаю с достаточным запасом энергии для предстоящих задач.',
  },
  {
    id: 6,
    factor: 'recovery',
    en: 'I can mentally switch off from work after the workday.',
    ru: 'После рабочего дня я могу мысленно отключиться от работы.',
  },
  {
    id: 7,
    factor: 'recovery',
    en: 'Work-related tiredness carries over into the next day.',
    ru: 'Усталость от работы сохраняется у меня и на следующий день.',
    reverse: true,
  },
  {
    id: 8,
    factor: 'recovery',
    en: 'Even after time off or sleep, I still feel drained by work.',
    ru: 'Даже после отдыха или сна я всё ещё чувствую себя истощённым работой.',
    reverse: true,
  },
  {
    id: 9,
    factor: 'controlClarity',
    en: 'I know what matters most when everything cannot be done.',
    ru: 'Я понимаю, что важнее всего, когда невозможно сделать всё.',
  },
  {
    id: 10,
    factor: 'controlClarity',
    en: 'I can influence the order, timing, or scope of my work when needed.',
    ru: 'Когда это необходимо, я могу влиять на порядок, сроки или объём своей работы.',
  },
  {
    id: 11,
    factor: 'controlClarity',
    en: 'I can say when something will not fit without feeling I must absorb it anyway.',
    ru: 'Я могу сказать, что какая-то задача не помещается в мои возможности, не чувствуя, что всё равно обязан её взять на себя.',
  },
  {
    id: 12,
    factor: 'controlClarity',
    en: 'I often receive conflicting priorities that I cannot resolve.',
    ru: 'Я часто получаю противоречащие друг другу приоритеты, которые не могу самостоятельно разрешить.',
    reverse: true,
  },
];
