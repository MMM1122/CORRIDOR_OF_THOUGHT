import {NextRequest,NextResponse} from 'next/server';
import {loadProject,saveProject} from '@/lib/db';
import {actionSchema} from '@/lib/validation';
import {applyAction} from '@/lib/actions';
import {aiAnalyze} from '@/lib/ai';
import {failure,localOnly} from '@/lib/api';
export const runtime='nodejs';
export async function POST(req:NextRequest){try{localOnly(req);const raw=await req.text();if(raw.length>2000000)throw Error('Request too large');const body=JSON.parse(raw);if(!Number.isInteger(body.version))throw Error('A project version is required');const a=actionSchema.parse(body.action);const p=loadProject();const result=a.type==='ai'?await aiAnalyze(p,a.documentId):applyAction(p,a);return NextResponse.json({project:saveProject(result,body.version)});}catch(e){return failure(e);}}
