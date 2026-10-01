import { getAlphaDb } from './db.js';
import { hashSecretToken } from './tokens.js';
import type { SustainabilityFactor, SustainabilityStatus } from '../../assessmentModel.js';

export type AlphaManagerRole = 'department_manager' | 'org_admin';

export type AlphaManagerAccess = {
  id: number;
  role: AlphaManagerRole;
  organizationId: number;
  organizationSlug: string;
  organizationDisplayName: string;
  orgUnitId: number | null;
  orgUnitSlug: string | null;
  orgUnitDisplayName: string | null;
};

const statusFromScore = (score: number): SustainabilityStatus => {
  if (score >= 80) return 'green';
  if (score >= 65) return 'stable';
  if (score >= 45) return 'needs_attention';
  return 'at_risk';
};

const weakestFactorFromScores = (
  workloadBalance: number,
  recovery: number,
  controlClarity: number
): SustainabilityFactor => {
  const drags: Array<{ factor: SustainabilityFactor; drag: number; order: number }> = [
    { factor: 'workloadBalance', drag: 0.4 * (100 - workloadBalance), order: 0 },
    { factor: 'recovery', drag: 0.4 * (100 - recovery), order: 1 },
    { factor: 'controlClarity', drag: 0.2 * (100 - controlClarity), order: 2 },
  ];
  drags.sort((a, b) => b.drag - a.drag || a.order - b.order);
  return drags[0].factor;
};

export const findManagerAccess = async (token: string): Promise<AlphaManagerAccess | null> => {
  const sql = getAlphaDb();
  const rows = await sql`
    SELECT
      ma.id,
      ma.role,
      ma.organization_id,
      org.slug AS organization_slug,
      org.display_name AS organization_display_name,
      ma.org_unit_id,
      ou.slug AS org_unit_slug,
      ou.display_name AS org_unit_display_name
    FROM alpha_manager_access ma
    JOIN alpha_organizations org
      ON org.id = ma.organization_id
    LEFT JOIN alpha_org_units ou
      ON ou.id = ma.org_unit_id
    WHERE ma.token_hash = ${hashSecretToken(token)}
      AND ma.active = TRUE
      AND org.active = TRUE
      AND (ma.org_unit_id IS NULL OR ou.active = TRUE)
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    id: Number(row.id),
    role: row.role as AlphaManagerRole,
    organizationId: Number(row.organization_id),
    organizationSlug: String(row.organization_slug),
    organizationDisplayName: String(row.organization_display_name),
    orgUnitId: row.org_unit_id === null ? null : Number(row.org_unit_id),
    orgUnitSlug: row.org_unit_slug === null ? null : String(row.org_unit_slug),
    orgUnitDisplayName:
      row.org_unit_display_name === null ? null : String(row.org_unit_display_name),
  };
};

export const getManagerDepartmentOverview = async (manager: AlphaManagerAccess) => {
  const sql = getAlphaDb();
  const rows = await sql`
    SELECT
      ou.id,
      ou.slug,
      ou.display_name,
      COUNT(DISTINCT p.id) FILTER (WHERE p.active = TRUE)::int AS invite_count,
      COUNT(DISTINCT p.id) FILTER (
        WHERE p.active = TRUE
          AND p.first_opened_at IS NOT NULL
      )::int AS opened_count,
      COUNT(DISTINCT a.id) FILTER (
        WHERE p.active = TRUE
          AND a.wave = 'baseline'
      )::int AS response_count,
      ROUND(
        AVG(a.overall_score) FILTER (
          WHERE p.active = TRUE
            AND a.wave = 'baseline'
        )
      )::int AS overall_score,
      ROUND(
        AVG((a.factor_scores->'workloadBalance'->>'score')::numeric) FILTER (
          WHERE p.active = TRUE
            AND a.wave = 'baseline'
        )
      )::int AS workload_balance,
      ROUND(
        AVG((a.factor_scores->'recovery'->>'score')::numeric) FILTER (
          WHERE p.active = TRUE
            AND a.wave = 'baseline'
        )
      )::int AS recovery,
      ROUND(
        AVG((a.factor_scores->'controlClarity'->>'score')::numeric) FILTER (
          WHERE p.active = TRUE
            AND a.wave = 'baseline'
        )
      )::int AS control_clarity
    FROM alpha_org_units ou
    LEFT JOIN alpha_participants p
      ON p.org_unit_id = ou.id
    LEFT JOIN alpha_assessments a
      ON a.participant_id = p.id
    WHERE ou.organization_id = ${manager.organizationId}
      AND ou.active = TRUE
      AND (${manager.role} = 'org_admin' OR ou.id = ${manager.orgUnitId})
    GROUP BY ou.id, ou.slug, ou.display_name
    ORDER BY ou.display_name
  `;

  return rows.map((row) => {
    const inviteCount = Number(row.invite_count);
    const openedCount = Number(row.opened_count);
    const responseCount = Number(row.response_count);
    const progress = {
      invitesIssued: inviteCount,
      opened: openedCount,
      completed: responseCount,
      unlockAt: 5,
    };

    if (responseCount < 5) {
      return {
        slug: String(row.slug),
        displayName: String(row.display_name),
        ready: false as const,
        progress,
      };
    }

    const workloadBalance = Number(row.workload_balance);
    const recovery = Number(row.recovery);
    const controlClarity = Number(row.control_clarity);
    const overallScore = Number(row.overall_score);

    return {
      slug: String(row.slug),
      displayName: String(row.display_name),
      ready: true as const,
      n: responseCount,
      progress,
      overallScore,
      status: statusFromScore(overallScore),
      factors: {
        workloadBalance: {
          score: workloadBalance,
          status: statusFromScore(workloadBalance),
        },
        recovery: {
          score: recovery,
          status: statusFromScore(recovery),
        },
        controlClarity: {
          score: controlClarity,
          status: statusFromScore(controlClarity),
        },
      },
      weakestFactor: weakestFactorFromScores(
        workloadBalance,
        recovery,
        controlClarity
      ),
    };
  });
};
