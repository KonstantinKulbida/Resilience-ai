import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { ASSESSMENT_QUESTIONS } from '../../assessmentModel.js';
import type { DeterministicAssessmentScores } from '../assessmentScoring.js';

type ActionCopy = {
  title: string;
  body: string;
};

type SelectedActions = {
  today: ActionCopy;
  week: ActionCopy;
  support: ActionCopy;
};

export type AlphaGeminiInterpretation = {
  insightEn: string;
  insightRu: string;
  rationalesEn: {
    today: string;
    week: string;
    support: string;
  };
  rationalesRu: {
    today: string;
    week: string;
    support: string;
  };
};

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }
  return new GoogleGenAI({ apiKey });
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isTransientGeminiError = (error: unknown) => {
  const message = String((error as any)?.message || error || '');
  return (
    message.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.toLowerCase().includes('high demand') ||
    message.toLowerCase().includes('temporarily')
  );
};

export const generateAlphaInterpretations = async (
  scores: DeterministicAssessmentScores,
  workContext: string,
  actionsEn: SelectedActions,
  actionsRu: SelectedActions
): Promise<AlphaGeminiInterpretation> => {
  const ai = getClient();

  const weakestSignals = ASSESSMENT_QUESTIONS
    .filter((question) => scores.weakestQuestionIds.includes(question.id))
    .map((question) => {
      const score = scores.questionScores.find((item) => item.id === question.id)?.score;
      return (
        '- EN: ' + question.en +
        '\n  RU: ' + question.ru +
        '\n  score: ' + score + '/100'
      );
    })
    .join('\n');

  const run = async (model: string) => {
    const response = await ai.models.generateContent({
      model,
      contents: `
You are the interpretation layer of a non-clinical employee work-sustainability product.

The scores below have already been calculated deterministically. You must not recalculate, change, reinterpret numerically, or invent any score.

Overall Work Sustainability: ${scores.score}/100 (${scores.status})
Workload balance: ${scores.factors.workloadBalance.score}/100
Recovery: ${scores.factors.recovery.score}/100
Control & clarity: ${scores.factors.controlClarity.score}/100
Primary pressure factor: ${scores.weakestFactor}
Work context: ${workContext}

Lowest-scoring statements inside the primary factor:
${weakestSignals || '- No additional item-level signal'}

The product has already selected these fixed actions. You may explain them, but you must not replace, rewrite, or add actions.

TODAY
EN title: ${actionsEn.today.title}
EN body: ${actionsEn.today.body}
RU title: ${actionsRu.today.title}
RU body: ${actionsRu.today.body}

THIS WEEK
EN title: ${actionsEn.week.title}
EN body: ${actionsEn.week.body}
RU title: ${actionsRu.week.title}
RU body: ${actionsRu.week.body}

SUPPORT
EN title: ${actionsEn.support.title}
EN body: ${actionsEn.support.body}
RU title: ${actionsRu.support.title}
RU body: ${actionsRu.support.body}

Return:
- insightEn and insightRu: equivalent localized interpretations, each 4–6 concise sentences.
  * Ground the interpretation in at least two concrete questionnaire signals.
  * Explain the likely work pattern connecting those signals and why it matters.
  * Use a relatively stronger factor as a practical resource or contrast when useful.
  * Avoid generic tautologies such as "your workload is high, so reduce workload".
  * Distinguish observation from certainty: say "this pattern may suggest" rather than inventing facts.
- todayRationaleEn / todayRationaleRu: 1–2 concise sentences explaining why the fixed TODAY action fits this specific pattern and what observable signal to watch after trying it.
- weekRationaleEn / weekRationaleRu: 1–2 concise sentences explaining why the fixed THIS WEEK action fits and what it is intended to test or change.
- supportRationaleEn / supportRationaleRu: 1–2 concise sentences explaining when the fixed SUPPORT action becomes appropriate and what concrete work constraint it is meant to surface.

Rules:
- Describe working conditions and current patterns, not personality.
- Do not diagnose burnout, anxiety, depression, or any medical condition.
- Do not recommend supplements, treatment, or clinical care.
- Do not introduce new numbers or change existing scores/status.
- Do not invent employee facts.
- Do not invent new actions.
- Do not mention AI, Gemini, prompts, or internal scoring logic.
- Keep the tone calm, specific, practical, and non-alarmist.
      `,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insightEn: { type: Type.STRING },
            insightRu: { type: Type.STRING },
            todayRationaleEn: { type: Type.STRING },
            todayRationaleRu: { type: Type.STRING },
            weekRationaleEn: { type: Type.STRING },
            weekRationaleRu: { type: Type.STRING },
            supportRationaleEn: { type: Type.STRING },
            supportRationaleRu: { type: Type.STRING },
          },
          required: [
            'insightEn',
            'insightRu',
            'todayRationaleEn',
            'todayRationaleRu',
            'weekRationaleEn',
            'weekRationaleRu',
            'supportRationaleEn',
            'supportRationaleRu',
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error('Gemini returned an empty Alpha interpretation');
    }

    const parsed = JSON.parse(response.text) as Record<string, unknown>;
    const keys = [
      'insightEn',
      'insightRu',
      'todayRationaleEn',
      'todayRationaleRu',
      'weekRationaleEn',
      'weekRationaleRu',
      'supportRationaleEn',
      'supportRationaleRu',
    ] as const;

    for (const key of keys) {
      if (typeof parsed[key] !== 'string' || String(parsed[key]).trim().length === 0) {
        throw new Error('Gemini returned an invalid Alpha interpretation');
      }
    }

    return {
      insightEn: String(parsed.insightEn).trim(),
      insightRu: String(parsed.insightRu).trim(),
      rationalesEn: {
        today: String(parsed.todayRationaleEn).trim(),
        week: String(parsed.weekRationaleEn).trim(),
        support: String(parsed.supportRationaleEn).trim(),
      },
      rationalesRu: {
        today: String(parsed.todayRationaleRu).trim(),
        week: String(parsed.weekRationaleRu).trim(),
        support: String(parsed.supportRationaleRu).trim(),
      },
    };
  };

  let lastError: unknown;
  const modelSequence = ['gemini-3.8-flash', 'gemini-3.8-flash', 'gemini-3.5-flash'];

  for (let attempt = 0; attempt < modelSequence.length; attempt += 1) {
    try {
      return await run(modelSequence[attempt]);
    } catch (error) {
      lastError = error;
      if (!isTransientGeminiError(error) || attempt === modelSequence.length - 1) {
        throw error;
      }
      await wait(attempt === 0 ? 350 : 900);
    }
  }

  throw lastError;
};
