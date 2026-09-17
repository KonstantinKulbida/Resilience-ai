import type { AppLanguage } from '../types';
import type { WorkSustainabilityResult } from '../assessmentModel';
import { calculateAssessmentScores } from '../server/assessmentScoring';
import {
  buildFallbackInsight,
  getAssessmentGuidanceMode,
  getDefaultActionIds,
  getNonPressureActions,
  resolveAction,
} from '../server/assessmentActions';

const postJson = async <T>(
  url: string,
  body: unknown
): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `AI request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
};

export const getPersonalizedAdvice = async (
  mood: string,
  stressLevel: number,
  language: AppLanguage
): Promise<string> => {
  try {
    const data = await postJson<{
      advice: string;
    }>('/api/check-in', {
      mood,
      stressLevel,
      language,
    });

    return (
      data.advice ||
      (language === 'ru'
        ? 'Не удалось получить рекомендацию.'
        : "We couldn't generate a recommendation right now.")
    );
  } catch (error) {
    console.error(
      'AI API Error:',
      error
    );

    return language === 'ru'
      ? 'Сервис временно недоступен. Сделайте короткую паузу и попробуйте ещё раз чуть позже.'
      : 'The AI service is temporarily unavailable. Take a short pause and try again in a moment.';
  }
};

const buildLocalAssessmentFallback = (
  answers: Record<string, number>,
  language: AppLanguage
): WorkSustainabilityResult => {
  const scores =
    calculateAssessmentScores(answers);

  const guidanceMode =
    getAssessmentGuidanceMode(scores);

  if (guidanceMode !== 'pressure') {
    return {
      score: scores.score,
      status: scores.status,
      factors: scores.factors,
      weakestFactor: scores.weakestFactor,
      insight: buildFallbackInsight(
        scores,
        language
      ),
      actions: getNonPressureActions(
        scores,
        language
      ),
      aiEnhanced: false,
    };
  }

  const actionIds =
    getDefaultActionIds(
      scores.weakestFactor
    );

  return {
    score: scores.score,
    status: scores.status,
    factors: scores.factors,
    weakestFactor: scores.weakestFactor,
    insight: buildFallbackInsight(
      scores,
      language
    ),
    actions: {
      today: resolveAction(
        actionIds.today,
        language
      ),
      week: resolveAction(
        actionIds.week,
        language
      ),
      support: resolveAction(
        actionIds.support,
        language
      ),
    },
    aiEnhanced: false,
  };
};

export const analyzeAssessment = async (
  answers: Record<string, number>,
  language: AppLanguage
): Promise<WorkSustainabilityResult> => {
  try {
    const apiResult =
      await postJson<WorkSustainabilityResult>(
        '/api/assessment',
        {
          answers,
          language,
        }
      );

    const localScores =
      calculateAssessmentScores(answers);

    const factorsMatch = (
      [
        'workloadBalance',
        'recovery',
        'controlClarity',
      ] as const
    ).every(
      (factor) =>
        apiResult.factors?.[factor]
          ?.score ===
          localScores.factors[factor]
            .score &&
        apiResult.factors?.[factor]
          ?.status ===
          localScores.factors[factor]
            .status
    );

    const payloadMatches =
      apiResult.score ===
        localScores.score &&
      apiResult.status ===
        localScores.status &&
      apiResult.weakestFactor ===
        localScores.weakestFactor &&
      factorsMatch;

    if (!payloadMatches) {
      console.warn(
        'Assessment API payload disagrees with deterministic scoring; using local fallback.'
      );

      return buildLocalAssessmentFallback(
        answers,
        language
      );
    }

    return apiResult;
  } catch (error) {
    console.warn(
      'Assessment API unavailable; using local deterministic fallback.',
      error
    );

    return buildLocalAssessmentFallback(
      answers,
      language
    );
  }
};