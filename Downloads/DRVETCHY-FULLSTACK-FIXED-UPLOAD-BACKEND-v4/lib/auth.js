import {cookies} from 'next/headers';import {SignJWT,jwtVerify} from 'jose';import {db} from './db';
const secret=new TextEncoder().encode(process.env.AUTH_SECRET||'change-me-in-production');
export async function setSession(u){const t=await new SignJWT({uid:u.id}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret);(await cookies()).set('dv_session',t,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800})}
export async function getUser(){try{const t=(await cookies()).get('dv_session')?.value;if(!t)return null;const {payload}=await jwtVerify(t,secret);return db.user.findUnique({where:{id:String(payload.uid)}})}catch{return null}}
export async function clearSession(){(await cookies()).delete('dv_session')}
