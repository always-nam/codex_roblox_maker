import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await mkdir(out,{recursive:true});
const html=(await readFile(new URL('public/index.html',root),'utf8')).replace('<html lang="ko">','<html lang="ko" data-runtime="static">');
await writeFile(new URL('index.html',out),html);
for(const name of ['style.css','app.js','runtime.js','favicon.svg'])await copyFile(new URL('public/'+name,root),new URL(name,out));
await copyFile(new URL('planner.mjs',root),new URL('planner.mjs',out));
await writeFile(new URL('.nojekyll',out),'');
console.log('GitHub Pages build complete: dist/ (static files only, no credentials or server).');
