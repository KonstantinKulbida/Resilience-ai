import { randomBytes, createHash } from 'node:crypto';
import { getAlphaDb } from '../../server/alpha/db.js';
import assessmentHandler from './assessment.js';
import managerSessionHandler from './manager/session.js';

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

const makeToken = () => randomBytes(32).toString('base64url');
const hash = (token: string) =>
  createHash('sha256').update(token, 'utf8').digest('hex');

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false });
  }

  const sql = getAlphaDb();
  let participantId: number | null = null;
  const managerIds: number[] = [];

  try {
    const scopeRows = await sql`
      SELECT
        org.id AS organization_id,
        dev.id AS development_id
      FROM alpha_organizations org
      JOIN alpha_org_units dev
        ON dev.organization_id = org.id
        AND dev.slug = 'development'
      WHERE org.slug = 'pilot-company-01'
        AND org.active = TRUE
        AND dev.active = TRUE
      LIMIT 1
    `;

    if (!scopeRows[0]) throw new Error('pilot_scope_missing');

    const organizationId = Number(scopeRows[0].organization_id);
    const developmentId = Number(scopeRows[0].development_id);

    const employeeToken = makeToken();
    const participantRows = await sql`
      INSERT INTO alpha_participants
        (token_hash, org_unit_id, questionnaire_version, scoring_version, invite_batch, active)
      VALUES
        (${hash(employeeToken)}, ${developmentId}, 'ws12-v1', 'ws-score-v1', 'alpha-diagnostic', TRUE)
      RETURNING id
    `;
    participantId = Number(participantRows[0].id);

    const answers = {
      1: 3, 2: 4, 3: 2, 4: 4,
      5: 3, 6: 2, 7: 4, 8: 4,
      9: 3, 10: 3, 11: 2, 12: 4,
    };

    const employee = await invoke(assessmentHandler, {
      token: employeeToken,
      answers,
      language: 'en',
    });

    const departmentManagerToken = makeToken();
    const departmentManagerRows = await sql`
      INSERT INTO alpha_manager_access
        (token_hash, role, organization_id, org_unit_id, active)
      VALUES
        (${hash(departmentManagerToken)}, 'department_manager', ${organizationId}, ${developmentId}, TRUE)
      RETURNING id
    `;
    managerIds.push(Number(departmentManagerRows[0].id));

    const orgAdminToken = makeToken();
    const orgAdminRows = await sql`
      INSERT INTO alpha_manager_access
        (token_hash, role, organization_id, org_unit_id, active)
      VALUES
        (${hash(orgAdminToken)}, 'org_admin', ${organizationId}, NULL, TRUE)
      RETURNING id
    `;
    managerIds.push(Number(orgAdminRows[0].id));

    const departmentManager = await invoke(managerSessionHandler, {
      token: departmentManagerToken,
      language: 'en',
    });
    const orgAdmin = await invoke(managerSessionHandler, {
      token: orgAdminToken,
      language: 'en',
    });

    const checks = {
      employeeAssessment:
        employee.statusCode === 200 &&
        employee.body?.alreadySubmitted === false,
      geminiInterpretation:
        employee.statusCode === 200 &&
        employee.body?.result?.aiEnhanced === true &&
        typeof employee.body?.result?.insight === 'string' &&
        employee.body.result.insight.length > 0,
      departmentManagerScope:
        departmentManager.statusCode === 200 &&
        departmentManager.body?.valid === true &&
        departmentManager.body?.role === 'department_manager' &&
        departmentManager.body?.departmentScope?.slug === 'development' &&
        Array.isArray(departmentManager.body?.departments) &&
        departmentManager.body.departments.length === 1,
      orgAdminScope:
        orgAdmin.statusCode === 200 &&
        orgAdmin.body?.valid === true &&
        orgAdmin.body?.role === 'org_admin' &&
        orgAdmin.body?.departmentScope === null &&
        Array.isArray(orgAdmin.body?.departments) &&
        orgAdmin.body.departments.some((item: any) => item.slug === 'development') &&
        orgAdmin.body.departments.some((item: any) => item.slug === 'sales'),
      privacySuppression:
        Array.isArray(departmentManager.body?.departments) &&
        departmentManager.body.departments.every(
          (item: any) => item.ready === false && item.n === undefined
        ),
    };

    const ok = Object.values(checks).every(Boolean);
    return res.status(ok ? 200 : 500).json({ ok, checks });
  } catch (error: any) {
    console.error('Alpha release diagnostic error', error);
    return res.status(500).json({
      ok: false,
      error: 'diagnostic_failed',
      message: String(error?.message || error),
    });
  } finally {
    try {
      if (managerIds.length > 0) {
        await sql`DELETE FROM alpha_manager_access WHERE id = ANY(${managerIds})`;
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
      console.error('Alpha release diagnostic cleanup error', cleanupError);
    }
  }
}
