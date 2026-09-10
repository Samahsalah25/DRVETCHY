import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';
import {getUser} from '../../../lib/auth';

export async function GET(){
 try{
  const row=await db.setting.findUnique({where:{id:'main'}});
  const data=row?.data;
  if(data&&typeof data==='object'&&!Array.isArray(data)){
   // Supports both the old {settings,messages} shape and the new flat shape.
   if(data.settings&&typeof data.settings==='object'){
    const settings={...data.settings};
    for(const key of ['logoUrl','aboutImage1','aboutImage2']) if(typeof settings[key]==='string'&&!settings[key].startsWith('data:image/')) settings[key]='';
    return NextResponse.json({...settings,messages:data.messages||{}});
   }
   const result={...data};
   for(const key of ['logoUrl','aboutImage1','aboutImage2']) if(typeof result[key]==='string'&&!result[key].startsWith('data:image/')) result[key]='';
   return NextResponse.json(result);
  }
  return NextResponse.json({});
 }catch(e){return NextResponse.json({error:e.message},{status:500})}
}
export async function PUT(req){
 const u=await getUser(); if(!u?.isAdmin)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const data=await req.json();
  if(data&&typeof data==='object'&&data.settings&&typeof data.settings==='object'){
   const flat={...data.settings,messages:data.messages||data.settings.messages||{}};
   await db.setting.upsert({where:{id:'main'},update:{data:flat},create:{id:'main',data:flat}});
  }else{
   await db.setting.upsert({where:{id:'main'},update:{data},create:{id:'main',data}});
  }
  return NextResponse.json({ok:true});
 }catch(e){return NextResponse.json({error:e.message||'Could not save settings'},{status:400})}
}
