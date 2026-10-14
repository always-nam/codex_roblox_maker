const staticMode=document.documentElement.dataset.runtime==='static';
export async function getStatus(){
 if(staticMode)return {aiConnected:false,staticMode:true,connectionVerified:false};
 const response=await fetch('/api/status');if(!response.ok)throw new Error('서버 연결 확인 필요');return response.json();
}
export async function generateResult(mode,input,signal){
 if(!staticMode){const response=await fetch('/api/generate',{method:'POST',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,input})});const result=await response.json();if(!response.ok)throw new Error(result.error||'결과를 가져오지 못했어요.');return result;}
 if(mode==='ai')throw new Error('AI 연결이 필요합니다. 이 GitHub Pages 버전에는 AI 서버가 없습니다. 제작 프롬프트와 예시 기획을 이용해 주세요.');
 if(!['prompt','example'].includes(mode))throw new Error('생성 모드를 확인해 주세요.');
 if(signal?.aborted)throw new DOMException('취소','AbortError');
 const planner=await import('./planner.mjs');
 if(signal?.aborted)throw new DOMException('취소','AbortError');
 const data=planner.validateInput(input);
 return planner.makeResult(data,mode==='example'?planner.validatePlan(planner.examplePlan(data)):null,mode);
}
