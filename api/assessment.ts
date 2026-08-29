import { generateAssessmentNarrative } from "../server/gemini.js";
import { calculateAssessmentScores } from "../server/assessmentScoring.js";

const isValidAnswers = (value: unknown): value is Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length !== 12) return false;

  return entries.every(([key, answer]) => {
    const questionId = Number(key);
    return (
      Number.isInteger(questionId) &&
      questionId >= 1 &&
      questionId <= 12 &&
      typeof answer === "number" &&
      Number.isInteger(answer) &&
      answer >= 1 &&
      answer <= 5
    );
  });
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers } = req.body ?? {};

  if (!isValidAnswers(answers)) {
    return res.status(400).json({ error: "Invalid assessment answers" });
  }

  try {
    const scores = calculateAssessmentScores(answers);
    const narrative = await generateAssessmentNarrative(scores);

    return res.status(200).json({
      burnoutPercentage: scores.burnoutPercentage,
      metrics: scores.metrics,
      ...narrative,
    });
  } catch (error) {
    console.error("Assessment AI error:", error);
    return res.status(503).json({ error: "AI service unavailable" });
  }
}
