import {NextResponse} from 'next/server';
import {db} from '../../../../lib/db';
import {getUser} from '../../../../lib/auth';

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
export async function PUT(req,{params}){
 const {id}=await params;
 const u=await getUser(); if(!u?.isAdmin)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const b=await req.json();const data=cleanProduct(b);const product=await db.product.update({where:{id:String(id)},data});return NextResponse.json({product})}
 catch(e){return NextResponse.json({error:e.message||'Could not update product'},{status:400})}
}
export async function DELETE(req,{params}){
 const {id}=await params;
 const u=await getUser(); if(!u?.isAdmin)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{await db.product.delete({where:{id:String(id)}});return NextResponse.json({ok:true})}
 catch(e){return NextResponse.json({error:e.message||'Could not delete product'},{status:400})}
}
