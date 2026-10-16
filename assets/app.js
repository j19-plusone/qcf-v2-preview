/* QCF v2 design preview — front-end demo only. No backend, no payments. */
const QCF=(()=>{
const L=()=>localStorage.getItem('qcf_lang')||(new URLSearchParams(location.search).get('lang')==='en'?'en':'zh');
const t=(zh,en)=>L()==='en'?en:zh;
const Q='<img class="qi" src="brand/qcf-q-glyph.svg" alt="Q">';
const NAV=[['index.html','首页','Home'],['register.html','注册文明 ID','Get Civilization ID'],['id.html','我的 ID','My ID'],['initiatives.html','文明倡议','Initiatives'],['about.html','关于我们','About']];
function chrome(){
  const here=location.pathname.split('/').pop()||'index.html';
  const links=NAV.map(([h,z,e])=>`<a href="${h}" class="${h===here?'on':''}" data-zh="${z}" data-en="${e}">${z}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin',`<header><div class="bar"><a class="brand" href="index.html"><img src="brand/qcf-q-full.svg" alt="QCF"><span>QUANTUM CIVILIZATION<br>FOUNDATION · 量子文明基金会</span></a>
<nav class="main">${links}</nav><div class="tools"><a class="btn sm reg" href="register.html" data-zh="领取文明 ID" data-en="Get your ID">领取文明 ID</a><button class="btn sm ghost" id="lang">EN</button><button class="burger" id="burger" aria-label="Menu" aria-expanded="false">☰</button></div></div>
<nav class="drawer" id="drawer">${links}<a href="impressum.html" class="small mute">Impressum · Privacy · Terms</a></nav></header>`);
  document.body.insertAdjacentHTML('beforeend',`<footer><div class="serif" style="font-size:17px;color:#f7f5ef">QCF · Quantum Civilization Foundation · 量子文明基金会</div>
<p data-zh="筹建阶段网站。基金会拟于瑞士楚格州设立，尚未完成商业登记；共建者基建费与捐赠将在正式登记后开放。Q 为不可转让的贡献值，不是加密货币，无货币价值，不可交易。本网站不对任何捐赠作出免税承诺。" data-en="Preparatory-stage website. The foundation is to be established in Zug, Switzerland and is not yet registered; co-builder fees and donations open after formal registration. Q is a non-transferable contribution point — not a cryptocurrency, with no monetary value, and not tradable. No tax-deductibility is claimed.">x</p>
<p data-zh="倡议编号 QCF-INIT-CB-20261003-001 · 全球文明共建者倡议" data-en="Initiative QCF-INIT-CB-20261003-001 · Global Civilization Co-builders Initiative">x</p>
<div class="links"><a href="impressum.html">Impressum</a><a href="privacy.html" data-zh="隐私政策" data-en="Privacy">隐私政策</a><a href="terms.html" data-zh="使用条款" data-en="Terms">使用条款</a><a href="about.html" data-zh="关于我们" data-en="About">关于我们</a></div>
<div class="small" data-zh="本网站不表示与联合国存在从属、认可或授权关系。" data-en="No affiliation with or endorsement by the United Nations is implied.">x</div></footer><div class="toast" id="toast"><img src="brand/qcf-q-full.svg" alt=""><div><b id="tb"></b><span id="ts"></span></div></div>`);
  const b=document.getElementById('burger'),d=document.getElementById('drawer');
  b.onclick=()=>{d.classList.toggle('open');b.setAttribute('aria-expanded',d.classList.contains('open'));b.textContent=d.classList.contains('open')?'✕':'☰'};
  document.getElementById('lang').onclick=()=>{localStorage.setItem('qcf_lang',L()==='zh'?'en':'zh');apply();document.dispatchEvent(new Event('qcf-lang'))};
  apply();
}
function apply(){const l=L();document.documentElement.lang=l==='en'?'en':'zh-CN';document.querySelectorAll('[data-zh]').forEach(e=>e.innerHTML=(e.dataset[l]||e.dataset.zh).replace(/\{Q\}/g,Q));const b=document.getElementById('lang');if(b)b.textContent=l==='zh'?'EN':'中文'}
function roll(el,to,dur=1800){const from=+el.dataset.v||0;el.dataset.v=to;const t0=performance.now();const f=n=>{const p=Math.min(1,(n-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=Math.round(from+(to-from)*e).toLocaleString('en-US').replace(/,/g,"'");if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function toast(b,s){const T=document.getElementById('toast');document.getElementById('tb').innerHTML=b;document.getElementById('ts').textContent=s||'';T.classList.add('show');clearTimeout(T._t);T._t=setTimeout(()=>T.classList.remove('show'),2600)}
// demo store
const S={get u(){return JSON.parse(localStorage.getItem('qcf_user')||'null')},set u(v){localStorage.setItem('qcf_user',JSON.stringify(v))},
 get h(){return JSON.parse(localStorage.getItem('qcf_hist')||'[]')},set h(v){localStorage.setItem('qcf_hist',JSON.stringify(v))}};
const today=()=>new Date().toISOString().slice(0,10);
function award(n,zh,en){const h=S.h;h.unshift({n,zh,en,ts:Date.now()});S.h=h;toast(t(`你获得了 ${n} Q`,`You received ${n} Q`),t(zh,en))}
const bal=()=>S.h.reduce((a,x)=>a+x.n,0);
async function hash(s){if(crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h.toString(16).repeat(8)}
function qr(seed){let s=parseInt(seed.slice(0,8),16)||7;const r=()=>(s=(s*1103515245+12345)>>>0)/4294967296;const n=21;let c='';for(let y=0;y<n;y++)for(let x=0;x<n;x++){const f=(x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13);if(f){const a=x>13?x-14:x,b=y>13?y-14:y;if(a==0||a==6||b==0||b==6||(a>1&&a<5&&b>1&&b<5))c+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}else if(r()>.55)c+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}return`<svg viewBox="0 0 21 21" class="qr" fill="#071321" shape-rendering="crispEdges">${c}</svg>`}
function globe(cv,points){const ctx=cv.getContext('2d');const D=Math.min(2,devicePixelRatio||1);let W,R;
 const size=()=>{W=cv.clientWidth;cv.width=cv.height=Math.round(W*D);R=W*.44};size();addEventListener('resize',size);
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;let LX,LI,GX,ready=false;
 const xyz=(la,lo)=>{la*=Math.PI/1800;lo*=Math.PI/1800;return[Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)]};
 fetch('data/earth.json').then(r=>r.json()).then(d=>{const l=d.lights,n=l.length/3;LX=new Float32Array(n*3);LI=new Uint8Array(n);for(let i=0;i<n;i++){const p=xyz(l[i*3],l[i*3+1]);LX.set(p,i*3);LI[i]=l[i*3+2]}
  const g=d.land,m=g.length/2;GX=new Float32Array(m*3);for(let i=0;i<m;i++)GX.set(xyz(g[i*2],g[i*2+1]),i*3);ready=true});
 const hot=points.map(p=>xyz(p.lat*10,p.lon*10));
 let rot=-0.35;const tilt=0.62,ct=Math.cos(tilt),st=Math.sin(tilt);let last=0;
 function draw(n){if(n-last<30&&!reduce){requestAnimationFrame(draw);return}last=n;
  ctx.setTransform(D,0,0,D,0,0);ctx.clearRect(0,0,W,W);const c0=W/2;
  const at=ctx.createRadialGradient(c0,c0,R*.96,c0,c0,R*1.12);at.addColorStop(0,'rgba(150,200,255,.55)');at.addColorStop(.25,'rgba(90,150,230,.22)');at.addColorStop(1,'rgba(40,80,160,0)');ctx.fillStyle=at;ctx.beginPath();ctx.arc(c0,c0,R*1.12,0,7);ctx.fill();
  const g=ctx.createRadialGradient(c0-R*.35,c0-R*.4,R*.05,c0,c0,R);g.addColorStop(0,'#112a49');g.addColorStop(.75,'#071629');g.addColorStop(1,'#030a16');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c0,c0,R,0,7);ctx.fill();
  const cr=Math.cos(rot),sr=Math.sin(rot);
  if(ready){ctx.fillStyle='rgba(70,110,160,.22)';for(let i=0;i<GX.length;i+=3){const x=GX[i],y=GX[i+1],z=GX[i+2];const X=x*cr+z*sr,Z0=-x*sr+z*cr,Z=y*st+Z0*ct;if(Z<0)continue;const Y=y*ct-Z0*st;ctx.fillRect(c0+X*R-1,c0-Y*R-1,2.2*Z+.4,2.2*Z+.4)}
   ctx.globalCompositeOperation='lighter';const tw=n/700;
   for(let i=0,k=0;k<LI.length;i+=3,k++){const x=LX[i],y=LX[i+1],z=LX[i+2];const X=x*cr+z*sr,Z0=-x*sr+z*cr,Z=y*st+Z0*ct;if(Z<.02)continue;const Y=y*ct-Z0*st;const v=LI[k];
    let a=(.18+v*.09)*Math.min(1,Z*2.2);if(v<6&&!reduce)a*=.65+.35*Math.sin(tw+k*1.7);const s=v>6?2.2:v>3?1.5:1.1;
    ctx.fillStyle=`rgba(242,207,107,${a.toFixed(2)})`;ctx.fillRect(c0+X*R-s/2,c0-Y*R-s/2,s,s)}
   ctx.globalCompositeOperation='source-over'}
  const pulse=reduce?.5:(Math.sin(n/600)+1)/2;
  hot.forEach(([x,y,z])=>{const X=x*cr+z*sr,Z0=-x*sr+z*cr,Z=y*st+Z0*ct;if(Z<0)return;const Y=y*ct-Z0*st,px=c0+X*R,py=c0-Y*R;const rg=ctx.createRadialGradient(px,py,0,px,py,14+pulse*12);rg.addColorStop(0,'rgba(255,240,200,.95)');rg.addColorStop(1,'rgba(242,207,107,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(px,py,28,0,7);ctx.fill();ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.arc(px,py,2.6,0,7);ctx.fill()});
  if(!reduce)rot-=.0012;requestAnimationFrame(draw)}
 let dx=null;cv.addEventListener('pointerdown',e=>dx=e.clientX);addEventListener('pointerup',()=>dx=null);cv.addEventListener('pointermove',e=>{if(dx!==null){rot-=(e.clientX-dx)*.006;dx=e.clientX}});
 requestAnimationFrame(draw)}
function odo(el,str){if(!el.children.length||el.children.length!==str.length){el.innerHTML=[...str].map(()=>'<span class="od"><span>'+[0,1,2,3,4,5,6,7,8,9].map(d=>'<i>'+d+'</i>').join('')+'</span></span>').join('')}
 [...str].forEach((c,i)=>{const s=el.children[i].firstChild;setTimeout(()=>s.style.transform='translateY(-'+(+c)+'em)',60*i)})}
// ID rule: 4-digit wave prefix + 6-digit sequence. Wave 2026 = #1..999999, then wave 2029 starts at 2029000001.
const WAVES=[2026,2029];
function idFor(n){const w=Math.floor((n-1)/999999),seq=(n-1)%999999+1;const pre=WAVES[w]||(WAVES[WAVES.length-1]+3*(w-WAVES.length+1));return pre+String(seq).padStart(6,'0')}
const localRegs=()=>localStorage.getItem('qcf_regs')?1:0;
document.addEventListener('DOMContentLoaded',chrome);
return{odo,idFor,localRegs,t,L,Q,roll,toast,S,award,bal,hash,qr,globe,today,apply};})();
