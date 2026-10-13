/* QCF v2 design preview — front-end demo only. No backend, no payments. */
const QCF=(()=>{
const L=()=>localStorage.getItem('qcf_lang')||(new URLSearchParams(location.search).get('lang')==='en'?'en':'zh');
const t=(zh,en)=>L()==='en'?en:zh;
const Q='<img class="qi" src="brand/qcf-q-glyph.svg" alt="Q">';
const NAV=[['index.html','首页','Home'],['register.html','注册文明 ID','Get Civilization ID'],['id.html','我的 ID','My ID'],['initiatives.html','文明倡议','Initiatives'],['about.html','关于我们','About']];
function chrome(){
  const here=location.pathname.split('/').pop()||'index.html';
  const links=NAV.map(([h,z,e])=>`<a href="${h}" class="${h===here?'on':''}" data-zh="${z}" data-en="${e}">${z}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin',`<div class="preview" data-zh="设计预览 v2 · 演示数据仅保存在本机浏览器 · 非正式上线网站" data-en="Design preview v2 · demo data stays in this browser · not the live site">设计预览 v2</div>
<header><div class="bar"><a class="brand" href="index.html"><img src="brand/qcf-q-full.svg" alt="QCF"><span>QUANTUM CIVILIZATION<br>FOUNDATION · 量子文明基金会</span></a>
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
function globe(cv,points){const ctx=cv.getContext('2d'),D=devicePixelRatio||1;let W,R;const size=()=>{W=cv.clientWidth;cv.width=cv.height=W*D;R=W*.42};size();addEventListener('resize',size);
 const N=1400,pts=[];for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=i*2.39996;pts.push([Math.cos(th)*r,y,Math.sin(th)*r])}
 const hot=points.map(p=>{const la=p.lat*Math.PI/180,lo=p.lon*Math.PI/180;return[Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)]});
 let rot=-0.15;const tilt=-0.35,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const prj=([x,y,z])=>{const c=Math.cos(rot),s=Math.sin(rot);let X=x*c+z*s,Z=-x*s+z*c;const ct=Math.cos(tilt),st=Math.sin(tilt);const Y=y*ct-Z*st;Z=y*st+Z*ct;return[W/2+X*R,W/2-Y*R,Z]};
 function draw(n){ctx.setTransform(D,0,0,D,0,0);ctx.clearRect(0,0,W,W);
  const g=ctx.createRadialGradient(W/2-R*.3,W/2-R*.3,R*.1,W/2,W/2,R*1.15);g.addColorStop(0,'#16365a');g.addColorStop(1,'#030915');ctx.fillStyle=g;ctx.beginPath();ctx.arc(W/2,W/2,R,0,7);ctx.fill();
  ctx.strokeStyle='#d5b67a33';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(W/2,W/2,R*1.18,R*.34,-.5,0,7);ctx.stroke();
  for(const p of pts){const[x,y,z]=prj(p);if(z<0)continue;ctx.fillStyle=`rgba(182,196,213,${.12+z*.5})`;ctx.fillRect(x,y,1.3+z*.9,1.3+z*.9)}
  const pulse=(Math.sin(n/500)+1)/2;
  hot.forEach(h=>{const[x,y,z]=prj(h);if(z<-.1)return;const a=Math.max(.2,z);const rg=ctx.createRadialGradient(x,y,0,x,y,18+pulse*14);rg.addColorStop(0,`rgba(243,220,164,${a})`);rg.addColorStop(1,'rgba(213,182,122,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(x,y,32,0,7);ctx.fill();ctx.fillStyle='#fff3d2';ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill()});
  // orbiting particle
  const a=n/2600,ox=W/2+Math.cos(a)*R*1.18,oy=W/2+Math.sin(a)*R*.34;const c=Math.cos(-.5),s=Math.sin(-.5);const px=W/2+(ox-W/2)*c-(oy-W/2)*s,py=W/2+(ox-W/2)*s+(oy-W/2)*c;ctx.fillStyle='#f3dca4';ctx.beginPath();ctx.arc(px,py,3,0,7);ctx.fill();
  if(!reduce)rot+=.0016;requestAnimationFrame(draw)}
 let dx=null;cv.addEventListener('pointerdown',e=>dx=e.clientX);addEventListener('pointerup',()=>dx=null);cv.addEventListener('pointermove',e=>{if(dx!==null){rot+=(e.clientX-dx)*.008;dx=e.clientX}});
 requestAnimationFrame(draw)}
// ID rule: 4-digit wave prefix + 6-digit sequence. Wave 2026 = #1..999999, then wave 2029 starts at 2029000001.
const WAVES=[2026,2029];
function idFor(n){const w=Math.floor((n-1)/999999),seq=(n-1)%999999+1;const pre=WAVES[w]||(WAVES[WAVES.length-1]+3*(w-WAVES.length+1));return pre+String(seq).padStart(6,'0')}
const localRegs=()=>localStorage.getItem('qcf_regs')?1:0;
document.addEventListener('DOMContentLoaded',chrome);
return{idFor,localRegs,t,L,Q,roll,toast,S,award,bal,hash,qr,globe,today,apply};})();
