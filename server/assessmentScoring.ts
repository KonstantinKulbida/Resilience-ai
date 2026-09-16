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

const FACTOR_WEIGHTS: Record<SustainabilityFactor, number> = {
  workloadBalance: 0.4,
  recovery: 0.4,
  controlClarity: 0.2,
};


const normalizeAnswer = (answer: number, reverse = false): number => {
  const sustainabilityOrientedAnswer = reverse ? 6 - answer : answer;
  return Math.round(((sustainabilityOrientedAnswer - 1) / 4) * 100);
};

export const getSustainabilityStatus = (score: number): SustainabilityStatus => {
  if (score >= 80) return 'green';
  if (score >= 65) return 'stable';
  if (score >= 45) return 'needs_attention';
  return 'at_risk';
};

const getPrimaryPressureFactor = (
  scores: Record<SustainabilityFactor, number>
): SustainabilityFactor =>
  FACTOR_ORDER.reduce((primary, factor) => {
    const primaryDrag =
      FACTOR_WEIGHTS[primary] * (100 - scores[primary]);
    const factorDrag =
      FACTOR_WEIGHTS[factor] * (100 - scores[factor]);

    // Larger weighted deficit means a larger drag on Work Sustainability.
    // Exact ties fall back to FACTOR_ORDER for deterministic behaviour.
    return factorDrag > primaryDrag ? factor : primary;
  });

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

  const rawFactorScores = FACTOR_ORDER.reduce((result, factor) => {
    result[factor] =
      buckets[factor].reduce((sum, value) => sum + value, 0) /
      buckets[factor].length;

    return result;
  }, {} as Record<SustainabilityFactor, number>);

  const factors = FACTOR_ORDER.reduce((result, factor) => {
    const factorScore = Math.round(rawFactorScores[factor]);

    result[factor] = {
      score: factorScore,
      status: getSustainabilityStatus(factorScore),
    };

    return result;
  }, {} as Record<SustainabilityFactor, { score: number; status: SustainabilityStatus }>);

  const score = Math.round(
    FACTOR_ORDER.reduce(
      (sum, factor) =>
        sum + FACTOR_WEIGHTS[factor] * rawFactorScores[factor],
      0
    )
  );

  const weakestFactor = getPrimaryPressureFactor(rawFactorScores);

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
