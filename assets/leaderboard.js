/* Public projections only: never use browser demo balances as a ledger. */
(function(){
const labels={administrator:['QCF管理员','QCF administrator'],member:['共建者会员','Co-builder member'],non_member:['共建者非会员','Co-builder non-member']};
function validate(payload){
 if(payload.status!=='ready'||!Array.isArray(payload.entries))throw new Error('unavailable');
 const seen=new Set();
 return payload.entries.map(row=>{if(!/^\d{10}$/.test(row.civilization_id)||seen.has(row.civilization_id)||!Number.isSafeInteger(row.q)||row.q<0||!Object.hasOwn(labels,row.category))throw new Error('invalid');seen.add(row.civilization_id);return {civilization_id:row.civilization_id,q:row.q,category:row.category};}).sort((a,b)=>b.q-a.q||a.civilization_id.localeCompare(b.civilization_id));
}
if(typeof module!=='undefined')module.exports={validate};
if(typeof document==='undefined')return;
let rows=null;
function render(){const body=document.getElementById('ranking');body.replaceChildren();const status=document.getElementById('ranking-status');if(rows===null){status.textContent=AccountI18n.t('pendingLedger');return;}status.textContent=rows.length?AccountI18n.t('confirmed'):AccountI18n.t('noPublic');for(const r of rows){const tr=document.createElement('tr');for(const value of [r.civilization_id,r.q.toLocaleString()+' Q',AccountI18n.t(r.category)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}}
fetch('data/leaderboard.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('unavailable');return r.json();}).then(p=>{rows=validate(p);render();}).catch(()=>render());document.addEventListener('account-language',render);
})();
