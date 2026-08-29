import { generatePersonalizedAdvice } from "../server/gemini";

const MAX_MOOD_LENGTH = 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mood, stressLevel } = req.body ?? {};

  if (
    typeof mood !== "string" ||
    !mood.trim() ||
    mood.length > MAX_MOOD_LENGTH ||
    typeof stressLevel !== "number" ||
    !Number.isFinite(stressLevel) ||
    stressLevel < 1 ||
    stressLevel > 10
  ) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const advice = await generatePersonalizedAdvice(mood.trim(), stressLevel);
    return res.status(200).json({ advice });
  } catch (error) {
    console.error("Check-in AI error:", error);
    return res.status(503).json({ error: "AI service unavailable" });
  }
}
