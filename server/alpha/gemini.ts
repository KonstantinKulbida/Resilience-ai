import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { ASSESSMENT_QUESTIONS } from '../../assessmentModel.js';
import type { DeterministicAssessmentScores } from '../assessmentScoring.js';

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
  workContext: string
): Promise<{ en: string; ru: string }> => {
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

  const run = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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

Return the same concise interpretation in two localized versions:
- insightEn: natural English
- insightRu: natural Russian
Each version must be 2–3 short sentences.

Rules:
- Explain the pattern and its practical meaning at work.
- Describe working conditions and current patterns, not personality.
- Do not diagnose burnout, anxiety, depression, or any medical condition.
- Do not recommend supplements, treatment, or clinical care.
- Do not introduce new numbers or change existing scores/status.
- Do not invent new actions; recommendations are selected separately by the product.
- Do not mention AI, Gemini, prompts, or internal scoring logic.
- Avoid generic wellness language when the signal is workload, priorities, control, or role clarity.
- Keep the tone calm, concrete, and non-alarmist.
      `,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insightEn: { type: Type.STRING },
            insightRu: { type: Type.STRING },
          },
          required: ['insightEn', 'insightRu'],
        },
      },
    });

    if (!response.text) {
      throw new Error('Gemini returned an empty Alpha interpretation');
    }

    const parsed = JSON.parse(response.text) as {
      insightEn?: unknown;
      insightRu?: unknown;
    };

    if (
      typeof parsed.insightEn !== 'string' ||
      parsed.insightEn.trim().length === 0 ||
      typeof parsed.insightRu !== 'string' ||
      parsed.insightRu.trim().length === 0
    ) {
      throw new Error('Gemini returned an invalid Alpha interpretation');
    }

    return {
      en: parsed.insightEn.trim(),
      ru: parsed.insightRu.trim(),
    };
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isTransientGeminiError(error) || attempt === 2) {
        throw error;
      }
      await wait(attempt === 0 ? 350 : 900);
    }
  }

  throw lastError;
};
