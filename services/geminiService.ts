import type { AIAnalysisResult } from "../types";

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
  stressLevel: number
): Promise<string> => {
  try {
    const data = await postJson<{ advice: string }>("/api/check-in", {
      mood,
      stressLevel,
    });

    return data.advice || "Не удалось получить рекомендацию.";
  } catch (error) {
    console.error("AI API Error:", error);
    return "Сервис временно недоступен. Попробуйте сделать глубокий вдох.";
  }
};

export const analyzeAssessment = async (
  answers: Record<string, number>
): Promise<AIAnalysisResult | null> => {
  try {
    const data = await postJson<AIAnalysisResult>("/api/assessment", { answers });
    return data;
  } catch (error) {
    console.error("AI API Error:", error);
    return null;
  }
};
