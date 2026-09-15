import {
  ASSESSMENT_QUESTIONS,
  type SustainabilityFactor,
  type SustainabilityStatus,
} from '../assessmentModel.js';

export type QuestionScore = {
  id: number;
  factor: SustainabilityFactor;
  score: number;
};

export type DeterministicAssessmentScores = {
  score: number;
  status: SustainabilityStatus;
  factors: Record<SustainabilityFactor, { score: number; status: SustainabilityStatus }>;
  weakestFactor: SustainabilityFactor;
  questionScores: QuestionScore[];
  weakestQuestionIds: number[];
};

const FACTOR_ORDER: SustainabilityFactor[] = [
  'workloadBalance',
  'recovery',
  'controlClarity',
];

const normalizeAnswer = (answer: number, reverse = false): number => {
  const sustainabilityOrientedAnswer = reverse ? 6 - answer : answer;
  return Math.round(((sustainabilityOrientedAnswer - 1) / 4) * 100);
};

const average = (values: number[]): number =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export const getSustainabilityStatus = (score: number): SustainabilityStatus => {
  if (score >= 80) return 'green';
  if (score >= 65) return 'stable';
  if (score >= 45) return 'needs_attention';
  return 'at_risk';
};

export const calculateAssessmentScores = (
  answers: Record<string, number>
): DeterministicAssessmentScores => {
  const buckets: Record<SustainabilityFactor, number[]> = {
    workloadBalance: [],
    recovery: [],
    controlClarity: [],
  };

  const questionScores: QuestionScore[] = ASSESSMENT_QUESTIONS.map((question) => {
    const answer = answers[String(question.id)];
    const score = normalizeAnswer(answer, question.reverse);
    buckets[question.factor].push(score);
    return { id: question.id, factor: question.factor, score };
  });

  const factors = FACTOR_ORDER.reduce((result, factor) => {
    const score = average(buckets[factor]);
    result[factor] = { score, status: getSustainabilityStatus(score) };
    return result;
  }, {} as Record<SustainabilityFactor, { score: number; status: SustainabilityStatus }>);

  const score = Math.round(
    FACTOR_ORDER.reduce((sum, factor) => sum + factors[factor].score, 0) /
      FACTOR_ORDER.length
  );

  const weakestFactor = FACTOR_ORDER.reduce((weakest, factor) =>
    factors[factor].score < factors[weakest].score ? factor : weakest
  );

  const weakestQuestionIds = questionScores
    .filter((item) => item.factor === weakestFactor)
    .sort((a, b) => a.score - b.score || a.id - b.id)
    .slice(0, 2)
    .map((item) => item.id);

  return {
    score,
    status: getSustainabilityStatus(score),
    factors,
    weakestFactor,
    questionScores,
    weakestQuestionIds,
  };
};
