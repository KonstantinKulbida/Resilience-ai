import { randomBytes, createHash } from 'node:crypto';
import { getAlphaDb } from '../../server/alpha/db.js';
import sessionHandler from './session.js';
import assessmentHandler from './assessment.js';
import feedbackHandler from './feedback.js';

type Capture = { statusCode:number; body:any; headers:Record<string,string> };
const invoke = async (handler:any, body:any):Promise<Capture> => {
  const capture:Capture={statusCode:200,body:null,headers:{}};
  const res:any={
    setHeader:(k:string,v:string)=>{capture.headers[k]=v;},
    status:(code:number)=>{capture.statusCode=code;return res;},
    json:(value:any)=>{capture.body=value;return res;}
  };
  await handler({method:'POST',body},res);
  return capture;
};

export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'});

  const sql=getAlphaDb();
  const token=randomBytes(32).toString('base64url');
  const hash=createHash('sha256').update(token,'utf8').digest('hex');
  let participantId:number|null=null;

  try{
    const org=await sql`SELECT id FROM alpha_org_units WHERE slug='development' AND active=TRUE LIMIT 1`;
    if(!org[0]) throw new Error('development_org_unit_missing');

    const inserted=await sql`
      INSERT INTO alpha_participants
        (token_hash,org_unit_id,questionnaire_version,scoring_version,invite_batch,active)
      VALUES
        (${hash},${Number(org[0].id)},'ws12-v1','ws-score-v1','alpha-diagnostic',TRUE)
      RETURNING id`;
    participantId=Number(inserted[0].id);

    const sessionBefore=await invoke(sessionHandler,{token,language:'en'});
    const answers={1:3,2:4,3:2,4:4,5:3,6:2,7:4,8:4,9:3,10:3,11:2,12:4};
    const assessmentFirst=await invoke(assessmentHandler,{token,answers,language:'en'});
    const assessmentDuplicate=await invoke(assessmentHandler,{token,answers,language:'en'});
    const feedback=await invoke(feedbackHandler,{token,wave:'baseline',usefulnessRating:4,usefulnessTag:'diagnostic'});
    const sessionAfter=await invoke(sessionHandler,{token,language:'ru'});

    const ok=
      sessionBefore.statusCode===200 && sessionBefore.body?.valid===true && sessionBefore.body?.baselineSubmitted===false &&
      assessmentFirst.statusCode===200 && assessmentFirst.body?.alreadySubmitted===false &&
      typeof assessmentFirst.body?.result?.score==='number' && assessmentFirst.body?.result?.aiEnhanced===false &&
      assessmentDuplicate.statusCode===200 && assessmentDuplicate.body?.alreadySubmitted===true &&
      feedback.statusCode===200 && feedback.body?.feedbackSubmitted===true &&
      sessionAfter.statusCode===200 && sessionAfter.body?.baselineSubmitted===true && sessionAfter.body?.feedbackSubmitted===true &&
      typeof sessionAfter.body?.result?.score==='number';

    return res.status(ok?200:500).json({
      ok,
      checks:{
        sessionBefore:sessionBefore.statusCode===200 && sessionBefore.body?.valid===true && sessionBefore.body?.baselineSubmitted===false,
        firstAssessment:assessmentFirst.statusCode===200 && assessmentFirst.body?.alreadySubmitted===false,
        duplicateProtection:assessmentDuplicate.statusCode===200 && assessmentDuplicate.body?.alreadySubmitted===true,
        feedback:feedback.statusCode===200 && feedback.body?.feedbackSubmitted===true,
        resume:sessionAfter.statusCode===200 && sessionAfter.body?.baselineSubmitted===true && sessionAfter.body?.feedbackSubmitted===true,
        serverScore:typeof assessmentFirst.body?.result?.score==='number',
        deterministicRecommendations:Array.isArray(assessmentFirst.body?.result?.selectedActionIds) && assessmentFirst.body.result.selectedActionIds.length===3
      }
    });
  }catch(error:any){
    console.error('Alpha diagnostic error',error);
    return res.status(500).json({ok:false,error:'diagnostic_failed',message:String(error?.message||error)});
  }finally{
    if(participantId){
      try{
        await sql`DELETE FROM alpha_feedback WHERE assessment_id IN (SELECT id FROM alpha_assessments WHERE participant_id=${participantId})`;
        await sql`DELETE FROM alpha_assessments WHERE participant_id=${participantId}`;
        await sql`DELETE FROM alpha_participants WHERE id=${participantId}`;
      }catch(cleanupError){
        console.error('Alpha diagnostic cleanup error',cleanupError);
      }
    }
  }
}