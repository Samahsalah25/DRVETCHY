import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';
import {getUser} from '../../../lib/auth';

export async function GET(){
 const u=await getUser();if(!u?.isAdmin)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{return NextResponse.json({orders:await db.order.findMany({include:{items:true},orderBy:{createdAt:'desc'}})})}
 catch(e){return NextResponse.json({error:e.message},{status:500})}
}
export async function POST(req){
 try{
  const b=await req.json();const u=await getUser();
  const rawItems=Array.isArray(b.items)?b.items:[];
  if(!rawItems.length)return NextResponse.json({error:'Order has no items'},{status:400});
  const ids=[...new Set(rawItems.map(x=>String(x.id||'' )).filter(Boolean))];
  const products=await db.product.findMany({where:{id:{in:ids}}});
  const byId=new Map(products.map(p=>[p.id,p]));
  const items=rawItems.map(x=>{
   const p=byId.get(String(x.id));if(!p)throw new Error(`Product not found: ${x.id}`);
   const qty=Math.max(1,Math.floor(Number(x.qty||1)));
   return {productId:p.id,qty,price:Number(p.price),nameAr:p.nameAr,nameEn:p.nameEn};
  });
  const total=items.reduce((sum,x)=>sum+x.price*x.qty,0);
  const n='DV-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);
  const o=await db.order.create({data:{orderNumber:n,userId:u?.id||null,customer:b.customer&&typeof b.customer==='object'?b.customer:{},total,items:{create:items}}});
  if(process.env.RESEND_API_KEY&&process.env.MAIL_FROM&&process.env.OWNER_EMAIL){
   try{
    const {Resend}=await import('resend');const resend=new Resend(process.env.RESEND_API_KEY);
    const text=`New DR VETCHY order ${n}\n\nCustomer: ${b.customer?.name||'-'}\nPhone: ${b.customer?.phone||'-'}\nAddress: ${b.customer?.address||'-'}\nItems: ${items.map(x=>`${x.nameEn||x.nameAr} × ${x.qty}`).join(' | ')}\nTotal: ${total.toLocaleString()} EGP`;
    await resend.emails.send({from:process.env.MAIL_FROM,to:process.env.OWNER_EMAIL,subject:`DR VETCHY | New order ${n}`,text});
   }catch(e){console.error('Order email failed',e)}
  }
  return NextResponse.json({order:{...o,items}},{status:201});
 }catch(e){return NextResponse.json({error:e.message||'Could not create order'},{status:400})}
}
