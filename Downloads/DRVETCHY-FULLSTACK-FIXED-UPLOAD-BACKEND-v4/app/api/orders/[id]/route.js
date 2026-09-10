import {NextResponse} from 'next/server';
import {db} from '../../../../lib/db';
import {getUser} from '../../../../lib/auth';

const allowed=['new','confirmed','received','cancelled'];
export async function PATCH(req,{params}){
 const u=await getUser();if(!u?.isAdmin)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const {id}=await params;const {status}=await req.json();
  if(!allowed.includes(status))return NextResponse.json({error:'Invalid status'},{status:400});
  const order=await db.order.update({where:{id:String(id)},data:{status},include:{items:true}});
  return NextResponse.json({order});
 }catch(e){return NextResponse.json({error:e.message||'Could not update order'},{status:400})}
}
