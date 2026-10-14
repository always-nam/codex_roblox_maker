import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {validateInput,examplePlan,validatePlan,makeResult,systemPrompt,titles} from './planner.mjs';
// Node loads secrets locally; never sends them to the browser or logs them.
try { process.loadEnvFile(); } catch(e) { if(e.code!=='ENOENT') throw e; }
const root=fileURLToPath(new URL('./public/',import.meta.url));
const port=Number(process.env.PORT||3000);
const apiKey=()=>process.env.AI_API_KEY||process.env.OPENAI_API_KEY;
export function aiConfigured(){return process.env.AI_PROVIDER!=='disabled' && !!apiKey() && !!process.env.AI_MODEL && (!process.env.AI_PROVIDER||process.env.AI_PROVIDER==='openai');}
export const adapters={
 openai:async(data,signal)=>{
  const schema={type:'object',additionalProperties:false,required:['title','questions','sections'],properties:{title:{type:'string'},questions:{type:'array',items:{type:'string'}},sections:{type:'array',items:{type:'object',additionalProperties:false,required:['id','title','content'],properties:{id:{type:'integer'},title:{type:'string'},content:{type:'string'}}}}}};
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal,headers:{'Authorization':`Bearer ${apiKey()}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AI_MODEL,instructions:systemPrompt,input:JSON.stringify(data),max_output_tokens:14000,text:{format:{type:'json_schema',name:'roblox_plan',strict:true,schema}}})});
  if(!response.ok){const e=new Error(response.status===429?'AI 제공자의 요청 또는 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.':response.status===401?'서버의 AI 인증 설정을 확인해 주세요.':'AI 제공자 요청이 실패했습니다. 입력은 보존되어 있습니다.');e.status=502;throw e;}
  const result=await response.json();
  if(result.status!=='completed')throw new Error('AI 응답이 완료되지 않았습니다. 범위를 줄여 다시 시도해 주세요.');
  const output=result.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
  try{return validatePlan(JSON.parse(output));}catch(e){throw new Error(`AI 결과 검증 실패: ${e.message}`);}
 }
};
const buckets=new Map();
function rateLimit(ip){const now=Date.now();const b=buckets.get(ip)||{count:0,start:now};if(now-b.start>60000){b.count=0;b.start=now;}if(b.count>=8)return false;b.count++;buckets.set(ip,b);if(buckets.size>10000)for(const [k,v]of buckets)if(now-v.start>60000)buckets.delete(k);return true;}
function send(res,status,data){if(res.destroyed)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let bytes=0;let chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>32768){const e=new Error('요청 크기가 너무 큽니다.');e.status=413;throw e;}chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw new Error('JSON 입력 형식이 올바르지 않습니다.');}}
export const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/status'&&req.method==='GET')return send(res,200,{aiConnected:aiConfigured(),provider:aiConfigured()?'openai':null,connectionVerified:false,storage:'browser',maxIdeaLength:4000});
 if(url.pathname==='/api/generate'&&req.method==='POST'){
  const origin=req.headers.origin;
  if(origin){let host;try{host=new URL(origin).host;}catch{return send(res,403,{error:'허용되지 않은 요청입니다.'});}if(host!==req.headers.host)return send(res,403,{error:'같은 사이트에서 요청해 주세요.'});}
  if(!rateLimit(req.socket.remoteAddress))return send(res,429,{error:'1분에 최대 8회 생성할 수 있습니다. 잠시 후 다시 시도해 주세요.'});
  const abort=new AbortController();let timeout=false;
  const timer=setTimeout(()=>{timeout=true;abort.abort();},Math.min(Math.max(Number(process.env.AI_TIMEOUT_MS)||90000,1000),180000));
  res.on('close',()=>{if(!res.writableEnded)abort.abort();});
  try{
   const raw=await body(req),data=validateInput(raw.input);
   if(!['prompt','example','ai'].includes(raw.mode))return send(res,400,{error:'생성 모드를 확인해 주세요.'});
   let plan=null;
   if(raw.mode==='example')plan=validatePlan(examplePlan(data));
   if(raw.mode==='ai'){
    if(!aiConfigured())return send(res,503,{error:'AI 연결이 필요합니다. 서버 설정에 API 키와 모델을 등록한 뒤 이용해 주세요. 지금은 제작 프롬프트와 예시 기획을 사용할 수 있습니다.',code:'AI_NOT_CONFIGURED'});
    plan=validatePlan(await adapters[process.env.AI_PROVIDER||'openai'](data,abort.signal));
   }
   send(res,200,makeResult(data,plan,raw.mode));
  }catch(e){if(!res.destroyed)send(res,e.status|| (timeout?504:400),{error:timeout?'생성 시간이 초과되었습니다. 입력을 확인하고 다시 시도해 주세요.':e.name==='AbortError'?'생성이 취소되었습니다.':e.message});}finally{clearTimeout(timer);}
  return;
 }
 if(url.pathname.startsWith('/api/'))return send(res,404,{error:'요청 경로가 없습니다.'});
 if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'허용되지 않은 요청입니다.'});
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return send(res,400,{error:'잘못된 경로입니다.'});}
 const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!path.startsWith(root))return send(res,403,{error:'접근할 수 없습니다.'});
 try{const file=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:file);}catch{return send(res,404,{error:'파일을 찾을 수 없습니다.'});}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(port,'0.0.0.0',()=>console.log(`Roblox planner listening on port ${port}`));
