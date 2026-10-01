import { generateAlphaInterpretation } from '../../server/alpha/gemini.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  const scores: any = {
    score: 53,
    status: 'needs_attention',
    factors: {
      workloadBalance: { score: 38, status: 'at_risk' },
      recovery: { score: 56, status: 'needs_attention' },
      controlClarity: { score: 69, status: 'stable' },
    },
    questionScores: [
      { id: 1, score: 50 }, { id: 2, score: 25 }, { id: 3, score: 25 }, { id: 4, score: 50 },
      { id: 5, score: 50 }, { id: 6, score: 50 }, { id: 7, score: 50 }, { id: 8, score: 75 },
      { id: 9, score: 75 }, { id: 10, score: 75 }, { id: 11, score: 50 }, { id: 12, score: 75 },
    ],
    weakestFactor: 'workloadBalance',
    weakestQuestionIds: [2, 3],
  };

  try {
    const insight = await generateAlphaInterpretation(
      scores,
      'en',
      'software_development'
    );
    return res.status(200).json({ ok: true, length: insight.length });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      name: String(error?.name || ''),
      message: String(error?.message || '').slice(0, 500),
    });
  }
}
