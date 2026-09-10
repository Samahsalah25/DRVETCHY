import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';
import {getUser} from '../../../lib/auth';

const fields=['nameAr','nameEn','category','typeAr','typeEn','price','color','materialAr','materialEn','descAr','descEn','image','stock'];
function cleanProduct(body){
 const p={};
 for(const k of fields) if(body?.[k]!==undefined) p[k]=body[k];
 p.price=Number(p.price);
 p.stock=Number.isFinite(Number(p.stock))?Number(p.stock):0;
 if(!Number.isFinite(p.price)||p.price<0) throw new Error('Invalid price');
 if(p.image!==undefined && p.image!=='' && !String(p.image).startsWith('data:image/')) throw new Error('Images must be uploaded from the device');
 if(typeof p.image==='string' && p.image.length>1500000) throw new Error('Image is too large');
 return p;
}
export async function GET(){try{const products=await db.product.findMany({orderBy:{createdAt:'desc'}});
   return NextResponse.json({products:products.map(p=>({...p,image:p.image?.startsWith('data:image/')?p.image:''}))})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
export async function POST(req){
 const u=await getUser(); if(!u?.isAdmin)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const b=await req.json();const data=cleanProduct(b);const product=await db.product.create({data});return NextResponse.json({product},{status:201})}
 catch(e){return NextResponse.json({error:e.message||'Could not create product'},{status:400})}
}
