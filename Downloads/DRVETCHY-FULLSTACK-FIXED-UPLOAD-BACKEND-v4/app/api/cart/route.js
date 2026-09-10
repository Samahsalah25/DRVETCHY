import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';
import {getUser} from '../../../lib/auth';
export async function GET(){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});const rows=await db.cartItem.findMany({where:{userId:u.id},include:{product:true}});return NextResponse.json({items:rows.map(r=>({...r.product,qty:r.qty}))})}
export async function PUT(req){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});const {items=[]}=await req.json();await db.$transaction([db.cartItem.deleteMany({where:{userId:u.id}}),...items.map(x=>db.cartItem.create({data:{userId:u.id,productId:String(x.id),qty:Math.max(1,Number(x.qty||1))}}))]);return NextResponse.json({ok:true})}
export async function DELETE(){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});await db.cartItem.deleteMany({where:{userId:u.id}});return NextResponse.json({ok:true})}
