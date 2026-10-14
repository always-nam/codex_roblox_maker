import './build-pages.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await build({entryPoints:[new URL('mobile/native-entry.js',root).pathname],bundle:true,format:'iife',outfile:new URL('native.js',out).pathname,minify:true});
let html=await readFile(new URL('index.html',out),'utf8');
html=html.replace('data-runtime="static"','data-runtime="static" data-native="true"')
 .replace('width=device-width, initial-scale=1','width=device-width, initial-scale=1, viewport-fit=cover')
 .replace('<title>로블록스 게임 최적화 제작기</title>','<title>게임 제작 프롬프트 메이커</title>')
 .replace('<small>로블록스 게임 최적화 제작기</small>','<small>게임 제작 프롬프트 메이커</small>')
 .replace('머릿속 아이디어를,<br><span>플레이 가능한 설계로.</span>','게임 아이디어를,<br><span>제작 프롬프트로.</span>')
 .replace('작은 아이디어 하나면 충분해요.<br>게임의 재미부터 제작 순서까지, 빠짐없이 준비해 보세요.','아이디어와 설정을 담아 프롬프트를 준비하세요.<br>실제 게임 제작은 다른 AI에게 전달해 진행합니다.')
 .replace('<button type="button" id="ai-button">','<button type="button" id="ai-button" hidden>')
 .replace('</footer>', '<a href="./privacy.html">개인정보 안내 · 문의</a></footer>')
 .replace('<script type="module" src="./app.js">','<script src="./native.js"></script><script type="module" src="./app.js">');
await writeFile(new URL('index.html',out),html);
await writeFile(new URL('style.css',out),(await readFile(new URL('style.css',out),'utf8'))+'\nhtml[data-native=true] .hero{padding:20px 4px 18px}html[data-native=true] .hero h1{font-size:28px;margin:10px 0}html[data-native=true] .eyebrow{display:none}html[data-native=true] .hero p{font-size:11px}html[data-native=true] .steps{margin-bottom:16px}body{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}header{padding-left:max(18px,env(safe-area-inset-left));padding-right:max(18px,env(safe-area-inset-right))}\n');
console.log('Native mobile assets prepared, offline prompt maker, no AI requests.');
