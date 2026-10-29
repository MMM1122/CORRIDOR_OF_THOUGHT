import {NextRequest,NextResponse} from 'next/server';
import {loadProject} from '@/lib/db';
import {failure,localOnly} from '@/lib/api';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){try{localOnly(req);return NextResponse.json({project:loadProject(),aiConfigured:!!process.env.AI_API_KEY&&!!process.env.AI_MODEL},{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
