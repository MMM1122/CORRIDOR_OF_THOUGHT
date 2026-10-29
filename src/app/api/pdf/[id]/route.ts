import {NextRequest,NextResponse} from 'next/server';
import fs from 'node:fs';import path from 'node:path';
import {dataDir,loadProject} from '@/lib/db';import {localOnly,failure} from '@/lib/api';
export const runtime='nodejs';
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{localOnly(req);const {id}=await params;const d=loadProject().documents.find(d=>d.id===id);if(!d)return new NextResponse('Not found',{status:404});return new NextResponse(fs.readFileSync(path.join(dataDir(),'originals',d.hash+'.pdf')),{headers:{'Content-Type':'application/pdf','Content-Disposition':`${req.nextUrl.searchParams.has('download')?'attachment':'inline'}; filename*=UTF-8''${encodeURIComponent(d.filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch(e){return failure(e);}}
