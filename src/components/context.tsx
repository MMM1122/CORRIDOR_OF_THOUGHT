'use client';
import {createContext,useContext} from 'react';
import type {Project,Anchor,ArgumentNode} from '@/lib/model';
export type View='Corridor'|'Library'|'Reader'|'Anatomy'|'Compare'|'Knowledge Graph'|'Feedback'|'Reflection';
export interface AppState {project:Project;activeId:string;setActiveId:(id:string)=>void;view:View;setView:(view:View)=>void;selectedIds:string[];setSelectedIds:(ids:string[])=>void;action:(action:unknown)=>Promise<Project|undefined>;inspect:(anchor:Anchor,node?:ArgumentNode)=>void;notify:(message:string)=>void;busy:boolean;aiConfigured:boolean;reload:()=>Promise<void>;}
export const AppContext=createContext<AppState>(null!);export const useApp=()=>useContext(AppContext);
export function Badge({children,tone=''}:{children:React.ReactNode;tone?:string}){return <span className={'badge '+tone}>{children}</span>}
export function Empty({title,children}:{title:string;children?:React.ReactNode}){return <div className="empty"><div className="empty-orbit">◎</div><h3>{title}</h3><p>{children}</p></div>}
export function SectionTitle({eyebrow,title,children}:{eyebrow:string;title:string;children?:React.ReactNode}){return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{children}</div>}
export function StatusSelect({value,onChange}:{value:string;onChange:(value:string)=>void}){return <select aria-label="Verification status" value={value} onChange={e=>onChange(e.target.value)}><option>Needs review</option><option>User confirmed</option><option>Dismissed</option></select>}
export function Download({kind,ids,children}:{kind:string;ids?:string[];children:React.ReactNode}){return <a className="button secondary" href={`/api/export?kind=${kind}${ids?'&ids='+ids.join(','):''}`} download>{children}</a>}
