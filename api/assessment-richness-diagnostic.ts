import assessmentHandler from './assessment.js';

type Capture = { statusCode: number; body: any };
const invoke = async (body: any): Promise<Capture> => {
  const capture: Capture = { statusCode: 200, body: null };
  const res: any = {
    setHeader: () => undefined,
    status: (statusCode: number) => {
      capture.statusCode = statusCode;
      return res;
    },
    json: (payload: any) => {
      capture.body = payload;
      return res;
    },
  };

  await assessmentHandler({ method: 'POST', body }, res);
  return capture;
};

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false });

  const answers = {
    1: 2,
    2: 5,
    3: 2,
    4: 5,
    5: 4,
    6: 4,
    7: 2,
    8: 2,
    9: 4,
    10: 4,
    11: 3,
    12: 2,
  };

  const result = await invoke({ answers, language: 'ru' });

  return res.status(result.statusCode).json({
    ok: result.statusCode === 200,
    aiEnhanced: result.body?.aiEnhanced,
    insight: result.body?.insight,
    actions: result.body?.actions,
  });
}
