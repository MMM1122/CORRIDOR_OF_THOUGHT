import {NextRequest,NextResponse} from 'next/server';
import {ConflictError} from './db';
export function localOnly(req:NextRequest){const host=req.headers.get('host')||'';if(!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host))throw Error('This server only accepts local requests.');const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==host)throw Error('Cross-origin requests are not allowed.');const fetchSite=req.headers.get('sec-fetch-site');if(fetchSite==='cross-site')throw Error('Cross-site requests are not allowed.');}
export function failure(e:unknown){return NextResponse.json({error:e instanceof Error?e.message:'Request failed'},{status:e instanceof ConflictError?409:400});}
