import { calculateAssessmentScores } from '../../server/assessmentScoring.js';
import { findParticipant, saveBaseline } from '../../server/alpha/repository.js';
import { isPlausibleToken } from '../../server/alpha/tokens.js';
import { isValidAssessmentAnswers, parseLanguage } from '../../server/alpha/validation.js';
import { ALPHA_VERSIONS } from '../../server/alpha/versions.js';
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'method_not_allowed'});}
  const {token,answers,language}=req.body??{};
  if(!isPlausibleToken(token)) return res.status(401).json({error:'invalid_invite'});
  if(!isValidAssessmentAnswers(answers)) return res.status(400).json({error:'invalid_assessment_answers'});
  try{
    const p=await findParticipant(token); if(!p) return res.status(401).json({error:'invalid_invite'});
    if(p.questionnaireVersion!==ALPHA_VERSIONS.questionnaire||p.scoringVersion!==ALPHA_VERSIONS.scoring) return res.status(409).json({error:'unsupported_participant_version'});
    return res.status(200).json(await saveBaseline(p,answers,calculateAssessmentScores(answers),parseLanguage(language)));
  }catch(e){console.error('Alpha assessment error',e);return res.status(503).json({error:'alpha_service_unavailable'});}
}