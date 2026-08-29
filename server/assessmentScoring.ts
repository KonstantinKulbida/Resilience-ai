export type AssessmentMetrics = {
  exhaustion: number;
  cynicism: number;
  inefficacy: number;
};

export type DeterministicAssessmentScores = {
  burnoutPercentage: number;
  metrics: AssessmentMetrics;
  riskBand: "low" | "moderate" | "high";
};

type Dimension = keyof AssessmentMetrics;

type ScoringItem = {
  id: number;
  dimension: Dimension;
  reverse?: boolean;
};

// Custom 12-item portfolio screening. It is not a clinical diagnostic instrument.
// Positive statements are reverse-scored so that 0 always means lower burnout risk
// and 100 always means higher burnout risk.
const SCORING_ITEMS: ScoringItem[] = [
  { id: 1, dimension: "exhaustion" },
  { id: 2, dimension: "exhaustion" },
  { id: 3, dimension: "exhaustion" },
  { id: 4, dimension: "exhaustion" },
  { id: 7, dimension: "exhaustion", reverse: true },

  { id: 5, dimension: "cynicism" },
  { id: 6, dimension: "cynicism" },
  { id: 10, dimension: "cynicism" },
  { id: 11, dimension: "cynicism" },

  { id: 8, dimension: "inefficacy", reverse: true },
  { id: 9, dimension: "inefficacy", reverse: true },
  { id: 12, dimension: "inefficacy", reverse: true },
];

const normalizeAnswer = (answer: number, reverse = false): number => {
  const riskOrientedAnswer = reverse ? 6 - answer : answer;
  return ((riskOrientedAnswer - 1) / 4) * 100;
};

const average = (values: number[]): number =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export const calculateAssessmentScores = (
  answers: Record<string, number>
): DeterministicAssessmentScores => {
  const buckets: Record<Dimension, number[]> = {
    exhaustion: [],
    cynicism: [],
    inefficacy: [],
  };

  for (const item of SCORING_ITEMS) {
    const answer = answers[String(item.id)];
    buckets[item.dimension].push(normalizeAnswer(answer, item.reverse));
  }

  const metrics: AssessmentMetrics = {
    exhaustion: average(buckets.exhaustion),
    cynicism: average(buckets.cynicism),
    inefficacy: average(buckets.inefficacy),
  };

  // Equal weighting keeps each conceptual dimension equally important even though
  // the dimensions contain different numbers of questions.
  const burnoutPercentage = Math.round(
    (metrics.exhaustion + metrics.cynicism + metrics.inefficacy) / 3
  );

  const riskBand =
    burnoutPercentage < 34
      ? "low"
      : burnoutPercentage < 67
        ? "moderate"
        : "high";

  return { burnoutPercentage, metrics, riskBand };
};
