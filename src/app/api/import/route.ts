import {NextRequest,NextResponse} from 'next/server';
import {importPdf} from '@/lib/pdf';
import {failure,localOnly} from '@/lib/api';
export const runtime='nodejs';
export async function POST(req:NextRequest){try{localOnly(req);if(Number(req.headers.get('content-length'))>26*1024*1024)throw Error('PDF exceeds the 25 MB limit');const data=await req.formData();const file=data.get('file');if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.pdf')||!['application/pdf',''].includes(file.type))throw Error('Select a PDF file');if(file.size>25*1024*1024)throw Error('PDF exceeds the 25 MB limit');return NextResponse.json(await importPdf(new Uint8Array(await file.arrayBuffer()),file.name));}catch(e){return failure(e);}}
