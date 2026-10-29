import fs from 'node:fs';
import path from 'node:path';
import {importPdf} from '../src/lib/pdf';
async function main(){const names=['Why This World.pdf','The World Did Not Come with a Formula.pdf','Why Our Knowledge Looks Like This.pdf','Why Our Knowledge Looks Like This (I Ching version).pdf'];
for(const name of names){const file=[path.join(process.cwd(),'seed-papers',name),path.join(process.cwd(),name)].find(p=>fs.existsSync(p));if(!file){console.log(`Not found: ${name}. Upload it in Library.`);continue;}const r=await importPdf(fs.readFileSync(file),name);console.log(`${r.duplicate?'Already imported':'Imported'}: ${name}`);}}main().catch(e=>{console.error(e);process.exitCode=1});
