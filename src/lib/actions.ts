import {z} from 'zod';
import {actionSchema} from './validation';
import {Project,Revision,uid,now,anchorFor} from './model';
import {cleanHtml,htmlText} from './content';
import {segment,conceptMatches} from './analysis';
import {attachAnalysis} from './pdf';
import {ConflictError} from './db';
export function applyAction(p:Project,a:z.infer<typeof actionSchema>){
 if(a.type==='save'||a.type==='checkout'){
 const d=p.documents.find(d=>d.id===a.documentId);if(!d)throw Error('Document not found');const base=p.revisions.find(r=>r.id===(a.type==='save'?a.baseRevisionId:a.revisionId)&&r.documentId===d.id);if(!base)throw Error('Revision not found');if(a.type==='save'&&d.currentRevisionId!==base.id)throw new ConflictError('This document has a newer revision. Your draft has been retained. Refresh to resolve.');
 const html=cleanHtml(a.type==='save'?a.html:base.html);if(a.type==='save'&&!a.force&&html===base.html)return p;
 const parsed=segment([{text:htmlText(html)}]);for(const b of parsed.blocks){const old=base.blocks.find(x=>x.text===b.text);if(old)b.page=old.page;}
 const r:Revision={id:uid(),documentId:d.id,parentId:base.id,kind:'working',label:a.type==='save'?(a.label||'Autosaved working copy'):`Branch from ${base.label}`,html,...parsed,createdAt:now()};p.revisions.push(r);d.currentRevisionId=r.id;attachAnalysis(p,r);
 const mapped=new Map<string,string>();for(const n of p.nodes.filter(n=>n.revisionId===r.id)){const old=p.nodes.find(o=>o.revisionId===base.id&&o.anchor.quote===n.anchor.quote);if(old){mapped.set(old.id,n.id);n.roles=old.roles;n.label=old.label;n.summary=old.summary;n.status=old.status;n.origin=old.origin;n.position=old.position;n.concepts=[...new Set([...n.concepts,...old.concepts])];}}
 const inherited=p.edges.filter(e=>e.revisionId===base.id&&mapped.has(e.source)&&mapped.has(e.target)).map(e=>({...e,id:uid(),revisionId:r.id,source:mapped.get(e.source)!,target:mapped.get(e.target)!}));p.edges=p.edges.filter(e=>e.revisionId!==r.id||!inherited.some(x=>x.source===e.source&&x.target===e.target));p.edges.push(...inherited);
 for(const annotation of p.annotations.filter(a=>a.documentId===d.id&&a.anchor)){annotation.needsReanchor=!r.blocks.some(b=>b.text.includes(annotation.anchor!.quote));}
 }else if(a.type==='metadata'){const d=p.documents.find(d=>d.id===a.documentId);if(!d)throw Error('Document not found');Object.assign(d,{title:a.title,tags:a.tags,metadata:a.metadata});}
 else if(a.type==='delete'){const list=p[a.collection] as {id:string}[];const i=list.findIndex(x=>x.id===a.id);if(i>=0)list.splice(i,1);}
 else if(a.type==='positions'){for(const pos of a.positions){const n=p.nodes.find(n=>n.id===pos.id);if(n)n.position={x:pos.x,y:pos.y};}}
 else if(a.type==='concept'){if(!p.customConcepts.includes(a.name))p.customConcepts.push(a.name);for(const n of p.nodes)n.concepts=[...new Set([...n.concepts,...conceptMatches(n.anchor.quote,p.customConcepts)])];}
 else if(a.type!=='ai'){const map={node:'nodes',edge:'edges',annotation:'annotations',feedback:'feedback',alignment:'alignments',cell:'cells',finding:'findings',reflection:'reflections'} as const;const list=p[map[a.type]] as {id:string}[];if(a.type==='node'){const existing=p.nodes.find(n=>n.id===a.value.id);if(existing&&(JSON.stringify(existing.anchor)!==JSON.stringify(a.value.anchor)))throw Error('An argument source anchor is immutable. Create a new node for a different source.');}const index=list.findIndex(x=>x.id===a.value.id);if(index<0)list.push(a.value);else list[index]=a.value;}
 p.audit.push({id:uid(),at:now(),action:a.type});return p;
}
