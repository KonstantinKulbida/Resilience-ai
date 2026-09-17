import { generateAssessmentPersonalization } from '../server/gemini.js';
import { calculateAssessmentScores } from '../server/assessmentScoring.js';
import {
  buildFallbackInsight,
  getAssessmentGuidanceMode,
  getDefaultActionIds,
  getNonPressureActions,
  resolveAction,
} from '../server/assessmentActions.js';

const isValidAnswers = (
  value: unknown
): value is Record<string, number> => {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return false;
  }

  const entries = Object.entries(
    value as Record<string, unknown>
  );

  if (entries.length !== 12) {
    return false;
  }

  return entries.every(([key, answer]) => {
    const questionId = Number(key);

    return (
      Number.isInteger(questionId) &&
      questionId >= 1 &&
      questionId <= 12 &&
      typeof answer === 'number' &&
      Number.isInteger(answer) &&
      answer >= 1 &&
      answer <= 5
    );
  });
};

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const { answers, language } = req.body ?? {};
  const responseLanguage =
    language === 'ru' ? 'ru' : 'en';

  if (!isValidAnswers(answers)) {
    return res.status(400).json({
      error: 'Invalid assessment answers',
    });
  }

  const scores =
    calculateAssessmentScores(answers);

  const guidanceMode =
    getAssessmentGuidanceMode(scores);

  if (guidanceMode !== 'pressure') {
    return res.status(200).json({
      score: scores.score,
      status: scores.status,
      factors: scores.factors,
      weakestFactor: scores.weakestFactor,
      insight: buildFallbackInsight(
        scores,
        responseLanguage
      ),
      actions: getNonPressureActions(
        scores,
        responseLanguage
      ),
      aiEnhanced: false,
    });
  }

  const defaultIds =
    getDefaultActionIds(
      scores.weakestFactor
    );

  let insight = buildFallbackInsight(
    scores,
    responseLanguage
  );

  let selectedIds = defaultIds;
  let aiEnhanced = false;

  try {
    const personalization =
      await generateAssessmentPersonalization(
        scores,
        responseLanguage
      );

    insight = personalization.insight;

    selectedIds = {
      today: personalization.todayActionId,
      week: personalization.weekActionId,
      support:
        personalization.supportActionId,
    };

    aiEnhanced = true;
  } catch (error) {
    console.error(
      'Assessment AI personalization error:',
      error
    );
  }

  return res.status(200).json({
    score: scores.score,
    status: scores.status,
    factors: scores.factors,
    weakestFactor: scores.weakestFactor,
    insight,
    actions: {
      today: resolveAction(
        selectedIds.today,
        responseLanguage
      ),
      week: resolveAction(
        selectedIds.week,
        responseLanguage
      ),
      support: resolveAction(
        selectedIds.support,
        responseLanguage
      ),
    },
    aiEnhanced,
  });
}