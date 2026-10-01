import { randomBytes, createHash } from 'node:crypto';
import { getAlphaDb } from '../../server/alpha/db.js';
import employeeSessionHandler from './session.js';
import assessmentHandler from './assessment.js';
import managerSessionHandler from './manager/session.js';
import { findManagerAccess } from '../../server/alpha/managerRepository.js';
import { isPlausibleToken } from '../../server/alpha/tokens.js';

type Capture = { statusCode: number; body: any };
const invoke = async (handler: any, body: any): Promise<Capture> => {
  const capture: Capture = { statusCode: 200, body: null };
  const res: any = {
    setHeader: () => undefined,
    status: (statusCode: number) => {
      capture.statusCode = statusCode;
      return res;
    },
    json: (body: any) => {
      capture.body = body;
      return res;
    },
  };
  await handler({ method: 'POST', body }, res);
  return capture;
};

const token = () => randomBytes(32).toString('base64url');
const hash = (value: string) =>
  createHash('sha256').update(value, 'utf8').digest('hex');

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false });

  const sql = getAlphaDb();
  let participantId: number | null = null;
  let managerId: number | null = null;

  try {
    const scope = await sql`
      SELECT org.id AS organization_id, ou.id AS org_unit_id
      FROM alpha_organizations org
      JOIN alpha_org_units ou
        ON ou.organization_id = org.id
        AND ou.slug = 'development'
      WHERE org.slug = 'pilot-company-01'
        AND org.active = TRUE
        AND ou.active = TRUE
      LIMIT 1
    `;

    if (!scope[0]) throw new Error('scope_missing');

    const organizationId = Number(scope[0].organization_id);
    const orgUnitId = Number(scope[0].org_unit_id);

    const employeeToken = token();
    const managerToken = token();

    const participant = await sql`
      INSERT INTO alpha_participants
        (token_hash, org_unit_id, questionnaire_version, scoring_version, invite_batch, active)
      VALUES
        (${hash(employeeToken)}, ${orgUnitId}, 'ws12-v1', 'ws-score-v1', 'alpha-progress-diagnostic', TRUE)
      RETURNING id
    `;
    participantId = Number(participant[0].id);

    const manager = await sql`
      INSERT INTO alpha_manager_access
        (token_hash, role, organization_id, org_unit_id, active)
      VALUES
        (${hash(managerToken)}, 'department_manager', ${organizationId}, ${orgUnitId}, TRUE)
      RETURNING id
    `;
    managerId = Number(manager[0].id);

    const directManager = await findManagerAccess(managerToken);
    const storedManager = await sql`
      SELECT
        token_hash = ${hash(managerToken)} AS hash_matches,
        active,
        role,
        organization_id,
        org_unit_id
      FROM alpha_manager_access
      WHERE id = ${managerId}
      LIMIT 1
    `;

    const before = await invoke(managerSessionHandler, {
      token: managerToken,
      language: 'en',
    });

    const employeeSession = await invoke(employeeSessionHandler, {
      token: employeeToken,
      language: 'en',
    });

    const afterOpen = await invoke(managerSessionHandler, {
      token: managerToken,
      language: 'en',
    });

    const answers = {
      1: 3, 2: 4, 3: 2, 4: 4,
      5: 3, 6: 2, 7: 4, 8: 4,
      9: 3, 10: 3, 11: 2, 12: 4,
    };

    const assessment = await invoke(assessmentHandler, {
      token: employeeToken,
      answers,
      language: 'en',
    });

    const afterComplete = await invoke(managerSessionHandler, {
      token: managerToken,
      language: 'en',
    });

    const beforeProgress = before.body?.departments?.[0]?.progress;
    const openProgress = afterOpen.body?.departments?.[0]?.progress;
    const completeProgress = afterComplete.body?.departments?.[0]?.progress;

    const checks = {
      tokenPlausible: isPlausibleToken(managerToken),
      storedHashMatches: storedManager[0]?.hash_matches === true,
      directManagerFound: Boolean(directManager),
      managerValid: before.statusCode === 200 && before.body?.valid === true,
      employeeValid:
        employeeSession.statusCode === 200 && employeeSession.body?.valid === true,
      openedTracked:
        Number(openProgress?.opened) === Number(beforeProgress?.opened) + 1,
      completedTracked:
        Number(completeProgress?.completed) === Number(beforeProgress?.completed) + 1,
      inviteTracked:
        Number(beforeProgress?.invitesIssued) >= 1 &&
        Number(completeProgress?.invitesIssued) === Number(beforeProgress?.invitesIssued),
      aggregateStillProtected:
        completeProgress?.completed < 5
          ? afterComplete.body?.departments?.[0]?.ready === false
          : true,
      assessmentSaved:
        assessment.statusCode === 200 && assessment.body?.alreadySubmitted === false,
    };

    const ok = Object.values(checks).every(Boolean);
    return res.status(ok ? 200 : 500).json({
      ok,
      checks,
      debug: {
        beforeStatus: before.statusCode,
        beforeBody: before.body,
        afterOpenStatus: afterOpen.statusCode,
        afterOpenBody: afterOpen.body,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: String(error?.message || error),
    });
  } finally {
    try {
      if (managerId) {
        await sql`DELETE FROM alpha_manager_access WHERE id = ${managerId}`;
      }
      if (participantId) {
        await sql`
          DELETE FROM alpha_feedback
          WHERE assessment_id IN (
            SELECT id FROM alpha_assessments WHERE participant_id = ${participantId}
          )
        `;
        await sql`DELETE FROM alpha_assessments WHERE participant_id = ${participantId}`;
        await sql`DELETE FROM alpha_participants WHERE id = ${participantId}`;
      }
    } catch (cleanupError) {
      console.error('Alpha progress diagnostic cleanup error', cleanupError);
    }
  }
}
