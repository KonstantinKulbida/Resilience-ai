import { isPlausibleToken } from '../../server/alpha/tokens.js';
import { parseLanguage } from '../../server/alpha/validation.js';
import { findParticipant, feedbackExists, getBaseline, markParticipantOpened } from '../../server/alpha/repository.js';
import { ALPHA_VERSIONS } from '../../server/alpha/versions.js';
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'method_not_allowed'});}
  const {token,language}=req.body??{};
  if(!isPlausibleToken(token)) return res.status(200).json({valid:false});
  try{
    const p=await findParticipant(token); if(!p) return res.status(200).json({valid:false}); await markParticipantOpened(p.id);
    if(p.questionnaireVersion!==ALPHA_VERSIONS.questionnaire||p.scoringVersion!==ALPHA_VERSIONS.scoring) return res.status(409).json({error:'unsupported_participant_version'});
    const lang=parseLanguage(language); const result=await getBaseline(p,lang); const feedbackSubmitted=await feedbackExists(p.id);
    return res.status(200).json({valid:true,department:{slug:p.slug,displayName:p.displayName},questionnaireVersion:p.questionnaireVersion,scoringVersion:p.scoringVersion,baselineSubmitted:Boolean(result),feedbackSubmitted,...(result?{result}:{})});
  }catch(e){console.error('Alpha session error',e);return res.status(503).json({error:'alpha_service_unavailable'});}
}