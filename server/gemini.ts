import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import type { AIAnalysisResult } from "../types";
import type { DeterministicAssessmentScores } from "./assessmentScoring";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  return new GoogleGenAI({ apiKey });
};

export const generatePersonalizedAdvice = async (
  mood: string,
  stressLevel: number
): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `
      Ты — эмпатичный помощник корпоративной wellbeing-программы.
      Сотрудник описывает свое состояние так: "${mood}" и оценивает свой уровень стресса как ${stressLevel} из 10.
      Дай краткую (максимум 3 предложения), поддерживающую рекомендацию и предложи одну простую технику, которую можно сделать прямо сейчас примерно за 2 минуты.
      Не ставь диагнозов и не используй Markdown, звездочки, заголовки или списки. Ответ должен быть на русском языке.
    `,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  return response.text || "Не удалось получить рекомендацию.";
};

type AssessmentNarrative = Pick<
  AIAnalysisResult,
  "productivityImpact" | "summary" | "recommendations"
>;

const isAssessmentNarrative = (value: unknown): value is AssessmentNarrative => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const result = value as Partial<AssessmentNarrative>;

  return (
    typeof result.productivityImpact === "string" &&
    result.productivityImpact.trim().length > 0 &&
    typeof result.summary === "string" &&
    result.summary.trim().length > 0 &&
    Array.isArray(result.recommendations) &&
    result.recommendations.length >= 3 &&
    result.recommendations.length <= 4 &&
    result.recommendations.every(
      (item) => typeof item === "string" && item.trim().length > 0
    )
  );
};

export const generateAssessmentNarrative = async (
  scores: DeterministicAssessmentScores
): Promise<AssessmentNarrative> => {
  const ai = getClient();

  const riskBandLabel = {
    low: "низкий",
    moderate: "умеренный",
    high: "высокий",
  }[scores.riskBand];

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `
      Ты — AI-компонент прототипа корпоративной wellbeing-платформы.

      Ниже — результаты 12-вопросного пользовательского скрининга риска выгорания. Это НЕ медицинская диагностика.
      Все числовые показатели уже рассчитаны приложением детерминированно по фиксированным правилам. НЕ пересчитывай, НЕ изменяй и НЕ придумывай числовые значения.
      Шкала везде 0-100: чем выше значение, тем выше выраженность соответствующего риска.

      Общий риск выгорания: ${scores.burnoutPercentage}/100 (${riskBandLabel}).
      Эмоциональное истощение: ${scores.metrics.exhaustion}/100.
      Цинизм / дистанцирование: ${scores.metrics.cynicism}/100.
      Ощущение неэффективности: ${scores.metrics.inefficacy}/100.

      Сформируй только качественную интерпретацию для сотрудника:
      1. productivityImpact — 1-2 предложения о возможном влиянии такого профиля на рабочую эффективность, без категоричных утверждений.
      2. summary — 2-3 предложения: какая из трех зон наиболее заметна и что это может означать в рабочем контексте.
      3. recommendations — 3-4 конкретных, реалистичных и низкорисковых следующих шага: восстановление, управление нагрузкой, границы, коммуникация с руководителем/HR или обращение за профессиональной поддержкой при сохраняющемся выраженном неблагополучии.

      Не ставь диагнозов. Не называй результат клиническим тестом. Не используй Markdown внутри строк. Пиши на русском языке.
    `,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productivityImpact: {
            type: Type.STRING,
            description: "Possible impact on work productivity, without diagnosis",
          },
          summary: {
            type: Type.STRING,
            description: "Short interpretation of the deterministic score profile",
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-4 actionable, low-risk next steps",
          },
        },
        required: ["productivityImpact", "summary", "recommendations"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty assessment response");
  }

  const parsed: unknown = JSON.parse(response.text);

  if (!isAssessmentNarrative(parsed)) {
    throw new Error("Gemini returned an invalid assessment narrative payload");
  }

  return parsed;
};
