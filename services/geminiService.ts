import type { AIAnalysisResult, AppLanguage } from "../types";

const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getPersonalizedAdvice = async (
  mood: string,
  stressLevel: number,
  language: AppLanguage
): Promise<string> => {
  try {
    const data = await postJson<{ advice: string }>("/api/check-in", {
      mood,
      stressLevel,
      language,
    });

    return data.advice || (language === 'ru'
      ? "Не удалось получить рекомендацию."
      : "We couldn't generate a recommendation right now.");
  } catch (error) {
    console.error("AI API Error:", error);
    return language === 'ru'
      ? "Сервис временно недоступен. Сделайте короткую паузу и попробуйте ещё раз чуть позже."
      : "The AI service is temporarily unavailable. Take a short pause and try again in a moment.";
  }
};

export const analyzeAssessment = async (
  answers: Record<string, number>,
  language: AppLanguage
): Promise<AIAnalysisResult | null> => {
  try {
    return await postJson<AIAnalysisResult>("/api/assessment", { answers, language });
  } catch (error) {
    console.error("AI API Error:", error);
    return null;
  }
};
