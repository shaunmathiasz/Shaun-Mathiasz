import {NextResponse} from 'next/server';
export function GET(){return new NextResponse('This public CV link has been retired. Please visit /request-cv.',{status:410,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});}
