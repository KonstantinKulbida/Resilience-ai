import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { AppLanguage } from '../types.js';
import { ASSESSMENT_QUESTIONS } from '../assessmentModel.js';
import type { DeterministicAssessmentScores } from './assessmentScoring.js';
import {
  getAllowedActionIds,
  isAllowedActionId,
} from './assessmentActions.js';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePersonalizedAdvice = async (
  mood: string,
  stressLevel: number,
  language: AppLanguage
): Promise<string> => {
  const ai = getClient();
  const languageInstruction =
    language === 'ru'
      ? 'Ответ должен быть на русском языке.'
      : 'Respond in natural, concise English.';

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `
Ты — эмпатичный помощник корпоративной wellbeing-программы.
Сотрудник описывает свое состояние так: "${mood}" и оценивает свой уровень стресса как ${stressLevel} из 10.
Дай краткую (максимум 3 предложения), поддерживающую рекомендацию и предложи одну простую технику, которую можно сделать прямо сейчас примерно за 2 минуты.
Не ставь диагнозов и не используй Markdown, звездочки, заголовки или списки. ${languageInstruction}
    `,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  return (
    response.text ||
    (language === 'ru'
      ? 'Не удалось получить рекомендацию.'
      : "We couldn't generate a recommendation right now.")
  );
};

type AssessmentPersonalizationSelection = {
  insight: string;
  todayActionId: string;
  weekActionId: string;
  supportActionId: string;
  todayRationale: string;
  weekRationale: string;
  supportRationale: string;
};

const isAssessmentPersonalizationSelection = (
  value: unknown,
  scores: DeterministicAssessmentScores
): value is AssessmentPersonalizationSelection => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const result = value as Partial<AssessmentPersonalizationSelection>;

  return (
    typeof result.insight === 'string' &&
    result.insight.trim().length > 0 &&
    typeof result.todayActionId === 'string' &&
    isAllowedActionId(scores.weakestFactor, 'today', result.todayActionId) &&
    typeof result.weekActionId === 'string' &&
    isAllowedActionId(scores.weakestFactor, 'week', result.weekActionId) &&
    typeof result.supportActionId === 'string' &&
    isAllowedActionId(scores.weakestFactor, 'support', result.supportActionId) &&
    typeof result.todayRationale === 'string' &&
    result.todayRationale.trim().length > 0 &&
    typeof result.weekRationale === 'string' &&
    result.weekRationale.trim().length > 0 &&
    typeof result.supportRationale === 'string' &&
    result.supportRationale.trim().length > 0
  );
};

export const generateAssessmentPersonalization = async (
  scores: DeterministicAssessmentScores,
  language: AppLanguage
): Promise<AssessmentPersonalizationSelection> => {
  const ai = getClient();
  const weakestQuestions = ASSESSMENT_QUESTIONS.filter((question) =>
    scores.weakestQuestionIds.includes(question.id)
  );

  const languageInstruction =
    language === 'ru'
      ? 'Пиши на естественном русском языке.'
      : 'Write in natural, concise English.';

  const questionSignals = weakestQuestions
    .map((question) => {
      const questionScore = scores.questionScores.find((item) => item.id === question.id)?.score;
      const text = language === 'ru' ? question.ru : question.en;
      return `- ${text} — ${questionScore}/100`;
    })
    .join('\n');

  const todayIds = getAllowedActionIds(scores.weakestFactor, 'today').join(', ');
  const weekIds = getAllowedActionIds(scores.weakestFactor, 'week').join(', ');
  const supportIds = getAllowedActionIds(scores.weakestFactor, 'support').join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `
You are the personalization layer of a non-clinical employee work-sustainability product.

IMPORTANT PRODUCT RULES:
- Scores are already calculated deterministically. Do not recalculate, change, reinterpret, or invent any numeric score.
- Higher score means better work sustainability.
- Do not diagnose burnout, depression, anxiety, or any medical condition.
- Describe working conditions and current patterns, not the employee's personality.
- Avoid generic wellness advice when the signal points to workload, priorities, control, or role clarity.
- Do not mention AI or the prompt.

Overall Work Sustainability: ${scores.score}/100 (${scores.status}).
Workload balance: ${scores.factors.workloadBalance.score}/100.
Recovery: ${scores.factors.recovery.score}/100.
Control & clarity: ${scores.factors.controlClarity.score}/100.
Primary pressure factor (largest weighted drag on the overall score): ${scores.weakestFactor}.

Lowest-scoring statements inside that factor:
${questionSignals}

Return:
1. insight — 4–6 concise sentences that feel genuinely personalized rather than generic.
   - Ground the explanation in at least two concrete signals from the questionnaire, not just the factor name.
   - Explain the likely work pattern connecting those signals and why it matters.
   - If another factor is relatively stronger, use it as a practical resource or contrast.
   - Distinguish observation from certainty: use language such as "this pattern may mean" rather than pretending to know facts not contained in the answers.
   - Do not merely restate that workload is high, recovery is low, or control is low.
2. todayActionId — choose exactly one ID from: ${todayIds}
3. weekActionId — choose exactly one ID from: ${weekIds}
4. supportActionId — choose exactly one ID from: ${supportIds}
5. todayRationale — 1–2 concise sentences explaining why the selected today action fits this specific response pattern and what useful signal the employee can observe after trying it.
6. weekRationale — 1–2 concise sentences explaining why the selected week action fits this specific response pattern and what it is intended to test or change.
7. supportRationale — 1–2 concise sentences explaining when the selected support action becomes appropriate and what concrete work constraint it is meant to surface.

The rationales must add context, not repeat the action title/body in different words.
Do not invent new action IDs or new employee facts. ${languageInstruction}
    `,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insight: { type: Type.STRING },
          todayActionId: { type: Type.STRING },
          weekActionId: { type: Type.STRING },
          supportActionId: { type: Type.STRING },
          todayRationale: { type: Type.STRING },
          weekRationale: { type: Type.STRING },
          supportRationale: { type: Type.STRING },
        },
        required: [
          'insight',
          'todayActionId',
          'weekActionId',
          'supportActionId',
          'todayRationale',
          'weekRationale',
          'supportRationale'
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty assessment personalization response');
  }

  const parsed: unknown = JSON.parse(response.text);
  if (!isAssessmentPersonalizationSelection(parsed, scores)) {
    throw new Error('Gemini returned an invalid assessment personalization payload');
  }

  return parsed;
};
