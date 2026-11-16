const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const emailOK=s=>typeof s==="string"&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const topicCodes=new Set(["qcf-e","qcf-l","qcf-u","activities","votes-initiatives"]);
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,"0")).join("");
async function body(req){const text=await req.text();if(text.length>12000)throw Error("too-large");return JSON.parse(text)}
async function resend(env,path,method="POST",payload){
  const r=await fetch("https://api.resend.com"+path,{method,headers:{Authorization:"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json"},body:payload?JSON.stringify(payload):undefined});
  if(!r.ok) throw Error("resend:"+r.status);return r.json();
}
function allowed(origin){return new Set(["https://qcf.org.cn","https://www.qcf.org.cn"]).has(origin)}
export default {async fetch(req,env){
  const u=new URL(req.url),origin=req.headers.get("Origin");
  if(req.method==="OPTIONS")return new Response(null,{status:allowed(origin)?204:403,headers:allowed(origin)?{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"}:{}});
  if(!u.pathname.startsWith("/api/"))return env.ASSETS?env.ASSETS.fetch(req):new Response("Not found",{status:404});
  try{
    if(req.method!=="POST")return json({error:"Method not allowed"},405);
    if(!allowed(origin))return json({error:"Please submit from qcf.org.cn"},403);
    if(!env.DB)return json({error:"CRM database not configured"},503);
    const d=await body(req),now=Math.floor(Date.now()/1000);
    if(u.pathname==="/api/cobuilders/register"){
      const email=(d.email||"").trim().toLowerCase(),name=(d.name||"").trim(),language=["zh","en"].includes(d.language)?d.language:"en";
      const topics=Array.isArray(d.topics)?[...new Set(d.topics.filter(x=>topicCodes.has(x)))]:[];
      if(!emailOK(email)||!d.consent||topics.length===0)return json({error:"Valid email, consent and at least one interest are required."},400);
      const personId=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID(),tokenHash=await sha(token);
      await env.DB.prepare("INSERT INTO people(id,email,display_name,language,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,language=excluded.language,updated_at=excluded.updated_at").bind(personId,email,name,language,"pending",now,now).run();
      const p=await env.DB.prepare("SELECT id FROM people WHERE email=?").bind(email).first();
      await env.DB.prepare("INSERT INTO email_verifications(person_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)").bind(p.id,tokenHash,now+86400,now).run();
      for(const code of topics){
        const t=await env.DB.prepare("SELECT id FROM interest_topics WHERE code=?").bind(code).first();
        if(t)await env.DB.prepare("INSERT INTO topic_subscriptions(person_id,topic_id,status,updated_at) VALUES(?,?,?,?) ON CONFLICT(person_id,topic_id) DO UPDATE SET status='pending',updated_at=excluded.updated_at").bind(p.id,t.id,"pending",now).run();
      }
      if(!env.RESEND_API_KEY||!env.EMAIL_FROM||!env.PUBLIC_ORIGIN)return json({message:"Registration saved; email verification is not yet enabled.",pending:true},202);
      await resend(env,"/emails","POST",{from:env.EMAIL_FROM,to:[email],reply_to:"Founder@qcf.org.cn",subject:language==="zh"?"确认你的QCF文明共建者登记":"Confirm your QCF Civilization Co-builder registration",text:(language==="zh"?"感谢加入QCF文明共建者。请在24小时内确认邮箱：\n":"Thank you for joining QCF. Confirm your email within 24 hours:\n")+env.PUBLIC_ORIGIN+"/confirm.html?token="+encodeURIComponent(token)});
      return json({message:"Verification email sent.",pending:true},201);
    }
    if(u.pathname==="/api/cobuilders/confirm"){
      const token=String(d.token||"");if(token.length<20)return json({error:"Invalid token"},400);
      const h=await sha(token),row=await env.DB.prepare("SELECT person_id FROM email_verifications WHERE token_hash=? AND expires_at>? AND used_at IS NULL").bind(h,now).first();
      if(!row)return json({error:"Expired or invalid token"},400);
      const civ="QCF-"+new Date().getUTCFullYear()+"-"+row.person_id.replace(/-/g,"").slice(0,10).toUpperCase();
      await env.DB.batch([
        env.DB.prepare("UPDATE people SET civilization_id=?,status='active',email_verified_at=?,updated_at=? WHERE id=?").bind(civ,now,now,row.person_id),
        env.DB.prepare("UPDATE email_verifications SET used_at=? WHERE token_hash=?").bind(now,h),
        env.DB.prepare("UPDATE topic_subscriptions SET status='active',confirmed_at=?,updated_at=? WHERE person_id=? AND status='pending'").bind(now,now,row.person_id)
      ]);
      return json({message:"Email verified.",civilization_id:civ});
    }
    return json({error:"Not found"},404);
  }catch(e){return json({error:"Service temporarily unavailable"},503)}
}};