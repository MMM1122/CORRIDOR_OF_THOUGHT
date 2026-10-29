import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {Project,emptyProject,validAnchor} from './model';
export const dataDir=()=>path.resolve(process.env.CORRIDOR_DATA_DIR||path.join(process.cwd(),'data'));
export function database(){const dir=dataDir();fs.mkdirSync(path.join(dir,'originals'),{recursive:true});const db=new DatabaseSync(path.join(dir,'corridor.sqlite'));db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,version INTEGER NOT NULL,payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS revisions(id TEXT PRIMARY KEY,document_id TEXT NOT NULL REFERENCES documents(id),payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS entities(id TEXT PRIMARY KEY,kind TEXT NOT NULL,document_id TEXT REFERENCES documents(id),revision_id TEXT REFERENCES revisions(id),payload TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS entities_kind ON entities(kind);
CREATE INDEX IF NOT EXISTS entities_revision ON entities(revision_id);
INSERT OR IGNORE INTO schema_migrations VALUES(1,datetime('now'));`);return db;}
const collections=['nodes','edges','annotations','feedback','alignments','cells','findings','reflections','analyses','audit'] as const;
export function loadProject():Project{const db=database();try{const row=db.prepare('SELECT payload FROM projects LIMIT 1').get() as {payload:string}|undefined;if(!row)return emptyProject();const p=JSON.parse(row.payload) as Project;p.documents=(db.prepare('SELECT payload FROM documents ORDER BY rowid').all() as {payload:string}[]).map(r=>JSON.parse(r.payload));p.revisions=(db.prepare('SELECT payload FROM revisions ORDER BY rowid').all() as {payload:string}[]).map(r=>JSON.parse(r.payload));for(const kind of collections)(p[kind] as unknown[])=(db.prepare('SELECT payload FROM entities WHERE kind=? ORDER BY rowid').all(kind) as {payload:string}[]).map(r=>JSON.parse(r.payload));return p;}finally{db.close();}}
export class ConflictError extends Error{}
export function validateProject(p:Project){
 if(!p||!Array.isArray(p.documents)||!Array.isArray(p.revisions))throw Error('Invalid project data');
 const allIds=[...p.documents,...p.revisions,...collections.flatMap(k=>p[k] as {id:string}[])].map(x=>x.id);if(new Set(allIds).size!==allIds.length)throw Error('Duplicate record IDs');
 const docs=new Set(p.documents.map(d=>d.id));const revs=new Map(p.revisions.map(r=>[r.id,r]));const nodes=new Map(p.nodes.map(n=>[n.id,n]));
 for(const d of p.documents){if(!/^[a-f0-9]{64}$/.test(d.hash)||revs.get(d.currentRevisionId)?.documentId!==d.id||revs.get(d.originalRevisionId)?.documentId!==d.id)throw Error('Invalid document references');}
 for(const r of p.revisions){if(!docs.has(r.documentId)||(r.parentId&&revs.get(r.parentId)?.documentId!==r.documentId))throw Error('Invalid revision reference');for(const b of r.blocks)if(r.text.slice(b.start,b.end)!==b.text)throw Error('Invalid block offsets');}
 for(const n of p.nodes){if(n.documentId!==n.anchor.documentId||n.revisionId!==n.anchor.revisionId||!validAnchor(p,n.anchor))throw Error('Argument quotation does not match its source');}
 for(const e of p.edges){const a=nodes.get(e.source),b=nodes.get(e.target);if(!a||!b||a.id===b.id||a.documentId!==e.documentId||b.documentId!==e.documentId||a.revisionId!==e.revisionId||b.revisionId!==e.revisionId)throw Error('Invalid argument relationship');}
 for(const a of p.annotations){if(!docs.has(a.documentId)||revs.get(a.revisionId)?.documentId!==a.documentId||(a.anchor&&(!validAnchor(p,a.anchor)||a.anchor.documentId!==a.documentId||a.anchor.revisionId!==a.revisionId)))throw Error('Invalid annotation source');}
 for(const f of p.feedback){if(!docs.has(f.documentId)||[f.beforeRevisionId,f.afterRevisionId].filter(Boolean).some(id=>revs.get(id)?.documentId!==f.documentId)||f.nodeIds.some(id=>nodes.get(id)?.documentId!==f.documentId))throw Error('Feedback references an unrelated document or revision');}
 for(const a of p.alignments)if(new Set(a.documentIds).size<2||[...a.left,...a.right].some(id=>!nodes.has(id)||!a.documentIds.includes(nodes.get(id)!.documentId)||!a.revisionIds.includes(nodes.get(id)!.revisionId)))throw Error('Invalid alignment source');
 for(const c of p.cells)if(revs.get(c.revisionId)?.documentId!==c.documentId||c.nodeIds.some(id=>nodes.get(id)?.documentId!==c.documentId||nodes.get(id)?.revisionId!==c.revisionId))throw Error('Invalid matrix evidence');
 for(const f of p.findings)if(revs.get(f.revisionId)?.documentId!==f.documentId||(f.nodeId&&nodes.get(f.nodeId)?.revisionId!==f.revisionId))throw Error('Invalid integrity evidence');
 for(const r of p.reflections)if(r.nodeIds.some(id=>!nodes.has(id)))throw Error('Invalid reflection evidence');
}
export function saveProject(p:Project,expectedVersion?:number){validateProject(p);const db=database();try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT version FROM projects LIMIT 1').get() as {version:number}|undefined;if(expectedVersion!==undefined&&(row?.version||0)!==expectedVersion)throw new ConflictError('Project changed in another tab. Refresh before saving.');p.version=(row?.version||0)+1;db.exec('DELETE FROM entities;DELETE FROM revisions;DELETE FROM documents;DELETE FROM projects;');const metadata={...p,documents:[],revisions:[]};for(const k of collections)(metadata[k] as unknown[])=[];db.prepare('INSERT INTO projects VALUES(?,?,?)').run(p.id,p.version,JSON.stringify(metadata));const sd=db.prepare('INSERT INTO documents VALUES(?,?,?)'),sr=db.prepare('INSERT INTO revisions VALUES(?,?,?)'),se=db.prepare('INSERT INTO entities VALUES(?,?,?,?,?)');for(const d of p.documents)sd.run(d.id,p.id,JSON.stringify(d));for(const r of p.revisions)sr.run(r.id,r.documentId,JSON.stringify(r));for(const k of collections)for(const e of p[k]){const x=e as {id:string;documentId?:string;revisionId?:string};se.run(x.id,k,x.documentId||null,x.revisionId||null,JSON.stringify(e));}db.exec('COMMIT');return p;}catch(error){db.exec('ROLLBACK');throw error;}finally{db.close();}}
