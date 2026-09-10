const http=require('http');
const port=process.env.PORT||3001;
const apiKey=process.env.RESEND_API_KEY;
const from=process.env.MAIL_FROM;
const to=process.env.OWNER_EMAIL||'samahsalah2555@gmail.com';
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data));}
const server=http.createServer((req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 if(req.method!=='POST'||req.url!='/api/email/order')return send(res,404,{message:'Not found'});
 let body='';req.on('data',c=>body+=c);req.on('end',async()=>{try{
  const {order,settings}=JSON.parse(body);if(!apiKey||!from)return send(res,503,{message:'Email is not configured. Add RESEND_API_KEY and MAIL_FROM.'});
  const subject=String(settings.ownerEmailSubject||'DR VETCHY | New order');
  const text=String(settings.ownerEmailTemplate||'New DR VETCHY order: {{orderNumber}}').replace(/{{(\w+)}}/g,(_,k)=>({orderNumber:order.orderNumber,name:order.customer.name,phone:order.customer.phone,address:order.customer.address,items:order.items.map(x=>`${x.nameAr} × ${x.qty}`).join(' | '),total:Number(order.total).toLocaleString('en-US'),notes:order.customer.notes||'-'}[k]||''));
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to,subject,text})});
  if(!r.ok)return send(res,502,{message:'Email provider rejected the request'});return send(res,200,{ok:true});
 }catch(e){return send(res,500,{message:'Email server error'})}});
});
server.listen(port,()=>console.log(`Email server listening on ${port}`));
