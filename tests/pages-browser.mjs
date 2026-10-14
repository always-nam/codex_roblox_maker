import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const root=resolve('dist'),prefix='/codex_roblox_maker/';let apiCalls=0;
const server=http.createServer(async(req,res)=>{if(req.url.includes('/api/'))apiCalls++;let file=req.url.startsWith(prefix)?req.url.slice(prefix.length):null;if(file===null||file.includes('..')){res.writeHead(404).end();return;}if(!file)file='index.html';try{const body=await readFile(resolve(root,file));res.writeHead(200,{'Content-Type':({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml'})[extname(file)]||'text/plain'});res.end(body);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);await page.locator('#ai-note').filter({hasText:'브라우저에서'}).waitFor();assert.match(await page.locator('#connection').textContent(),/AI 연결 필요/);console.log('PASS Pages 하위 경로·정적 모드 표시');
 await page.locator('#prompt-button').click();assert.match(await page.locator('#error-text').textContent(),/아이디어를 입력/);console.log('PASS 빈 입력 한국어 안내');
 await page.locator('[data-example="search"]').click();await page.locator('#settings').click();await page.locator('[name="budget"]').fill('미정 · 작은 범위');await page.locator('#prompt-button').click();await page.locator('#result').waitFor();const prompt=await page.locator('#prompt-content').textContent();assert.match(prompt,/미정 · 작은 범위/);assert.match(prompt,/기획 미생성/);assert.equal(await page.locator('#tab-plan').isDisabled(),true);console.log('PASS 서버 없이 설정 반영 프롬프트 생성');
 await page.locator('#copy-button').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),prompt);for(const ext of ['md','txt']){const dp=page.waitForEvent('download');await page.locator('#download-'+ext).click();assert.equal(await readFile(await(await dp).path(),'utf8'),prompt);}console.log('PASS 정적 모드 복사·두 다운로드 내용');
 const names=[];for(const key of ['search','coop','shop']){await page.locator('[data-example="'+key+'"]').click();await page.locator('#example-button').click();await page.waitForFunction(()=>document.querySelector('#tab-plan').getAttribute('aria-selected')==='true');names.push(await page.locator('#result-title').textContent());assert.equal(await page.locator('#plan-content section').count(),12);const spec=await page.locator('#section-5 pre').textContent();await page.locator('#tab-prompt').click();assert.ok((await page.locator('#prompt-content').textContent()).includes(spec));}assert.equal(new Set(names).size,3);console.log('PASS 정적 모드 3개 예시·12항목·원문 일치');
 const draft=await page.locator('#idea').inputValue();await page.locator('#ai-button').click();await page.locator('#error').waitFor();assert.match(await page.locator('#error-text').textContent(),/GitHub Pages/);assert.equal(await page.locator('#idea').inputValue(),draft);assert.equal(apiCalls,0);console.log('PASS AI 미지원 명시·API 요청 없음');
 await page.reload();assert.equal(await page.locator('#history-count').textContent(),'4');assert.equal(await page.locator('#idea').inputValue(),draft);await page.locator('.history-open').first().click();await page.locator('#result').waitFor();await page.locator('.history-delete').first().click();assert.equal(await page.locator('#history-count').textContent(),'3');console.log('PASS Pages 입력·보관 복원·삭제');
 await page.setViewportSize({width:360,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);console.log('PASS Pages 모바일·JavaScript 오류 없음');
 console.log('8 GitHub Pages browser checks passed.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
