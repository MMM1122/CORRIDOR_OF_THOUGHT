export const roles = ['Research Question','Central Thesis','Supporting Claim','Subclaim','Evidence','Example','Theoretical Framework','Reasoning','Assumption','Counterargument','Rebuttal','Limitation','Implication','Conclusion','Open Question'] as const;
export type Role = typeof roles[number];
export const relations = ['Supports','Challenges','Explains','Exemplifies','Depends On','Contradicts','Qualifies','Responds To','Extends'] as const;
export const feedbackCategories = ['Internal Cognitive Feedback','Human–AI Iterative Feedback','Cross-Model Feedback','Instructor Feedback','Other External Feedback'] as const;
export type Status = 'Needs review' | 'User confirmed' | 'Dismissed';
export type ChangeKind = 'Unclassified' | 'Elaboration' | 'Restructuring' | 'Rejected';
export interface Paper {id:string; title:string; filename:string; hash:string; tags:string[]; createdAt:string; originalRevisionId:string; currentRevisionId:string; extractionWarning?:string; metadata:string;}
export interface Revision {id:string; documentId:string; parentId?:string; kind:'extracted'|'working'; label:string; html:string; text:string; createdAt:string; blocks:Block[];}
export interface Block {id:string; text:string; page?:number; index:number; start:number; end:number; heading:boolean; level:number;}
export interface Anchor {documentId:string; revisionId:string; blockId:string; quote:string; start:number; end:number; page?:number;}
export interface ArgumentNode {id:string; documentId:string; revisionId:string; anchor:Anchor; roles:Role[]; label:string; summary:string; concepts:string[]; status:Status; origin:'Heuristic suggestion'|'User entered'|'AI suggestion'; position?:{x:number;y:number};}
export interface ArgumentEdge {id:string; documentId:string; revisionId:string; source:string; target:string; relation:typeof relations[number]; status:Status; origin:'Heuristic suggestion'|'User entered'|'AI suggestion'; note:string;}
export interface Annotation {id:string; documentId:string; revisionId:string; targetType:'paper'|'block'|'argument'|'concept'|'connection'|'feedback'; targetId:string; anchor?:Anchor; kind:'Comment'|'Highlight'|'Interpretation'|'Bookmark'|'Research question'; text:string; tags:string[]; needsReanchor:boolean; createdAt:string;}
export interface Feedback {id:string; category:typeof feedbackCategories[number]; source:string; timestamp:string; documentId:string; nodeIds:string[]; comment:string; interpretation:string; beforeRevisionId:string; afterRevisionId:string; evidence:string; status:Status; change:ChangeKind;}
export interface Alignment {id:string; left:string[]; right:string[]; documentIds:string[]; revisionIds:string[]; note:string; status:Status; change:ChangeKind; origin:'Heuristic suggestion'|'User entered';}
export interface MatrixCell {id:string; documentId:string; revisionId:string; row:string; summary:string; nodeIds:string[]; note:string; status:Status;}
export interface Finding {id:string; documentId:string; revisionId:string; nodeId?:string; question:string; note:string; status:Status;}
export interface Reflection {id:string; text:string; kind:'Observation'|'Interpretation'|'Hypothesis'|'Open question'; nodeIds:string[]; createdAt:string;}
export interface AnalysisRun {id:string; documentId:string; revisionId:string; mode:'local'|'ai'; createdAt:string; note:string;}
export interface Project {id:string; name:string; version:number; documents:Paper[]; revisions:Revision[]; nodes:ArgumentNode[]; edges:ArgumentEdge[]; annotations:Annotation[]; feedback:Feedback[]; alignments:Alignment[]; cells:MatrixCell[]; findings:Finding[]; reflections:Reflection[]; analyses:AnalysisRun[]; customConcepts:string[]; audit:{id:string; at:string; action:string}[];}
export const vocabulary=['Representation','Computation','Constraints','Recursiveness','Iteration','Frame Problem',"Marr's Levels of Analysis",'Metacognition','Cognitive Processing','Information Selection','Knowledge Building','Cultural Transmission','Path Dependence','Feedback Loops','Cognitive Tools','External Representations','I Ching'];
export const matrixRows=['Research Question','Central Thesis','Computational Goal','Representational Framework','Key Claims','Theoretical Concepts','Evidence','Examples','Counterarguments','Limitations','Conclusion','New Questions'];
export const uid=()=>globalThis.crypto.randomUUID();
export const now=()=>new Date().toISOString();
export const currentRevision=(p:Project,d:Paper)=>p.revisions.find(r=>r.id===d.currentRevisionId)!;
export const currentNodes=(p:Project,ids?:string[])=>p.nodes.filter(n=>p.documents.some(d=>d.id===n.documentId&&d.currentRevisionId===n.revisionId&&(!ids||ids.includes(d.id))));
export function emptyProject():Project{return {id:uid(),name:'Corridor of Thought',version:0,documents:[],revisions:[],nodes:[],edges:[],annotations:[],feedback:[],alignments:[],cells:[],findings:[],reflections:[],analyses:[],customConcepts:[],audit:[]};}
export function anchorFor(r:Revision,b:Block):Anchor{return {documentId:r.documentId,revisionId:r.id,blockId:b.id,quote:b.text,start:b.start,end:b.end,page:b.page};}
export function validAnchor(p:Project,a:Anchor):boolean{const r=p.revisions.find(r=>r.id===a.revisionId&&r.documentId===a.documentId);const b=r?.blocks.find(b=>b.id===a.blockId);return !!r&&!!b&&a.start>=b.start&&a.end<=b.end&&a.end>a.start&&r.text.slice(a.start,a.end)===a.quote;}
