import { findParticipant, saveFeedback } from '../../server/alpha/repository.js';
import { isPlausibleToken } from '../../server/alpha/tokens.js';
import { isValidFeedback } from '../../server/alpha/validation.js';
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'method_not_allowed'});}
  const {token,wave,usefulnessRating,usefulnessTag}=req.body??{};
  if(!isPlausibleToken(token)) return res.status(401).json({error:'invalid_invite'});
  if(!isValidFeedback(wave,usefulnessRating,usefulnessTag)) return res.status(400).json({error:'invalid_feedback'});
  try{
    const p=await findParticipant(token); if(!p) return res.status(401).json({error:'invalid_invite'});
    const saved=await saveFeedback(p.id,usefulnessRating,usefulnessTag); if(!saved) return res.status(404).json({error:'assessment_not_found'});
    return res.status(200).json({feedbackSubmitted:true});
  }catch(e){console.error('Alpha feedback error',e);return res.status(503).json({error:'alpha_service_unavailable'});}
}