import { randomBytes, createHash } from 'node:crypto';
import { getAlphaDb } from '../../server/alpha/db.js';
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

  const sql = getAlphaDb();
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
  let participantId: number | null = null;

  try {
    const org = await sql`
      SELECT id
      FROM alpha_org_units
      WHERE slug = 'development' AND active = TRUE
      LIMIT 1
    `;
    if (!org[0]) throw new Error('development_org_missing');

    const inserted = await sql`
      INSERT INTO alpha_participants
        (token_hash, org_unit_id, questionnaire_version, scoring_version, invite_batch, active)
      VALUES
        (${tokenHash}, ${Number(org[0].id)}, 'ws12-v1', 'ws-score-v1', 'alpha-guidance-diagnostic', TRUE)
      RETURNING id
    `;
    participantId = Number(inserted[0].id);

    const answers = {
      1: 2, 2: 5, 3: 2, 4: 5,
      5: 4, 6: 4, 7: 2, 8: 2,
      9: 4, 10: 4, 11: 3, 12: 2,
    };

    const result = await invoke({ token, answers, language: 'ru' });

    return res.status(result.statusCode).json({
      ok: result.statusCode === 200,
      aiEnhanced: result.body?.result?.aiEnhanced,
      insight: result.body?.result?.insight,
      actions: result.body?.result?.actions,
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: String(error?.message || error) });
  } finally {
    if (participantId) {
      try {
        await sql`DELETE FROM alpha_feedback WHERE assessment_id IN (SELECT id FROM alpha_assessments WHERE participant_id = ${participantId})`;
        await sql`DELETE FROM alpha_assessments WHERE participant_id = ${participantId}`;
        await sql`DELETE FROM alpha_participants WHERE id = ${participantId}`;
      } catch (cleanupError) {
        console.error('Alpha guidance diagnostic cleanup error', cleanupError);
      }
    }
  }
}
