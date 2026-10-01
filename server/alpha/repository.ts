import { getAlphaDb } from './db.js';
import { hashSecretToken } from './tokens.js';
import { ALPHA_VERSIONS } from './versions.js';
import { selectAlphaRecommendations, insightFor } from './recommendations.js';
import { generateAlphaInterpretations } from './gemini.js';
import type { AlphaLanguage, AlphaResult } from '../../alpha/types.js';
import type { DeterministicAssessmentScores } from '../assessmentScoring.js';

export type Participant = {
  id: number; orgUnitId: number; slug: string; displayName: string; workContext: string;
  questionnaireVersion: string; scoringVersion: string;
};

export const findParticipant = async (token: string): Promise<Participant | null> => {
  const sql = getAlphaDb();
  const rows = await sql`
    SELECT p.id, p.org_unit_id, p.questionnaire_version, p.scoring_version,
           o.slug, o.display_name, o.work_context
    FROM alpha_participants p
    JOIN alpha_org_units o ON o.id = p.org_unit_id
    WHERE p.token_hash = ${hashSecretToken(token)} AND p.active = TRUE AND o.active = TRUE
    LIMIT 1`;
  const row = rows[0];
  return row ? {
    id:Number(row.id), orgUnitId:Number(row.org_unit_id), slug:String(row.slug), displayName:String(row.display_name),
    workContext:String(row.work_context), questionnaireVersion:String(row.questionnaire_version), scoringVersion:String(row.scoring_version)
  } : null;
};

const resultFromRow = (row: any, participant: Participant, language: AlphaLanguage): AlphaResult => {
  const weakestFactor = row.weakest_factor;
  const weakIds = Array.isArray(row.weakest_question_ids) ? row.weakest_question_ids.map(Number) : [];
  const actions = selectAlphaRecommendations(weakestFactor, weakIds, participant.workContext, language);
  const aiInsight =
    language === 'ru' ? row.ai_insight_ru : row.ai_insight_en;
  const hasAiInsight =
    typeof aiInsight === 'string' && aiInsight.trim().length > 0;

  return {
    wave:'baseline', score:Number(row.overall_score), status: row.overall_status,
    factors: row.factor_scores, weakestFactor, weakestQuestionIds:weakIds,
    selectedActionIds:[actions.today.id,actions.week.id,actions.support.id],
    submittedAt:new Date(row.submitted_at).toISOString(),
    insight: hasAiInsight ? aiInsight : insightFor(weakestFactor,language),
    actions, aiEnhanced:hasAiInsight
  };
};

export const getBaseline = async (participant: Participant, language: AlphaLanguage): Promise<AlphaResult | null> => {
  const sql=getAlphaDb();
  const rows=await sql`SELECT *, CASE WHEN overall_score >= 80 THEN 'green' WHEN overall_score >= 65 THEN 'stable' WHEN overall_score >= 45 THEN 'needs_attention' ELSE 'at_risk' END AS overall_status FROM alpha_assessments WHERE participant_id=${participant.id} AND wave='baseline' LIMIT 1`;
  return rows[0] ? resultFromRow(rows[0],participant,language) : null;
};

export const markParticipantOpened = async (participantId: number) => {
  const sql = getAlphaDb();
  await sql`
    UPDATE alpha_participants
    SET first_opened_at = COALESCE(first_opened_at, NOW())
    WHERE id = ${participantId}
  `;
};

export const feedbackExists = async (participantId:number) => {
  const sql=getAlphaDb();
  const rows=await sql`SELECT EXISTS(SELECT 1 FROM alpha_feedback f JOIN alpha_assessments a ON a.id=f.assessment_id WHERE a.participant_id=${participantId} AND a.wave='baseline') AS exists`;
  return Boolean(rows[0]?.exists);
};

export const saveBaseline = async (participant: Participant, answers: Record<string,number>, scores: DeterministicAssessmentScores, language: AlphaLanguage) => {
  const sql=getAlphaDb();
  const actions=selectAlphaRecommendations(scores.weakestFactor,scores.weakestQuestionIds,participant.workContext,language);
  const ids=[actions.today.id,actions.week.id,actions.support.id];

  const inserted=await sql`
    INSERT INTO alpha_assessments
      (participant_id,org_unit_id,wave,questionnaire_version,scoring_version,recommendation_version,answers,overall_score,factor_scores,question_scores,weakest_factor,weakest_question_ids,selected_action_ids)
    VALUES
      (${participant.id},${participant.orgUnitId},'baseline',${participant.questionnaireVersion},${participant.scoringVersion},${ALPHA_VERSIONS.recommendation},
       ${sql.json(answers)},${scores.score},${sql.json(scores.factors)},${sql.json(scores.questionScores)},${scores.weakestFactor},${sql.json(scores.weakestQuestionIds)},${sql.json(ids)})
    ON CONFLICT (participant_id,wave) DO NOTHING RETURNING id`;

  if (inserted.length > 0) {
    try {
      const interpretations = await generateAlphaInterpretations(
        scores,
        participant.workContext
      );

      await sql`
        UPDATE alpha_assessments
        SET ai_insight_en = ${interpretations.en},
            ai_insight_ru = ${interpretations.ru}
        WHERE id = ${Number(inserted[0].id)}
      `;
    } catch {
      console.error('Alpha Gemini interpretation fallback used');
    }
  }

  const result=await getBaseline(participant,language);
  if (!result) throw new Error('Assessment persistence failed');
  return {alreadySubmitted:inserted.length===0,result};
};

export const saveFeedback = async (participantId:number,rating:number,tag?:string) => {
  const sql=getAlphaDb();
  const assessments=await sql`SELECT id FROM alpha_assessments WHERE participant_id=${participantId} AND wave='baseline' LIMIT 1`;
  if (!assessments[0]) return false;
  await sql`INSERT INTO alpha_feedback (assessment_id,usefulness_rating,usefulness_tag)
    VALUES (${Number(assessments[0].id)},${rating},${tag ?? null})
    ON CONFLICT (assessment_id) DO UPDATE SET usefulness_rating=EXCLUDED.usefulness_rating,usefulness_tag=EXCLUDED.usefulness_tag,updated_at=NOW()`;
  return true;
};