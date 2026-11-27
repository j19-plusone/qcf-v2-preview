/* QCF Briefs: category tabs, machine-translation link, request-full-text form. 2026-11-27
   FORM_ENDPOINT: leave empty until a free form backend (Zoho Forms / Formspree / Web3Forms)
   is connected. Submissions then fall back to mailto:Founder@qcf.org.cn. */
(function(){
  document.documentElement.classList.add('js');
  var FORM_ENDPOINT = '';
  var FOUNDERS = 'Founder@qcf.org.cn';
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  function show(cat){
    if(!tabs.length)return;
    if(!document.getElementById(cat))cat=tabs[0].dataset.cat;
    tabs.forEach(function(t){t.setAttribute('aria-selected',t.dataset.cat===cat?'true':'false')});
    [].forEach.call(document.querySelectorAll('.panel'),function(p){p.classList.toggle('on',p.dataset.panel===cat)});
  }
  tabs.forEach(function(t){t.onclick=function(){history.replaceState(null,'',location.pathname+location.search+'#'+t.dataset.cat);show(t.dataset.cat)}});
  show((location.hash||'').slice(1));
  window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
  function lang(){var s=document.getElementById('lang');return s?s.value:'zh'}
  function note(){
    var n=document.getElementById('mt-note'),l=lang();if(!n)return;
    if(l==='zh'||l==='en'){n.hidden=true;return}
    var u=new URL(location.href);u.searchParams.set('lang','en');
    n.innerHTML='This brief is published in Chinese and English. <a target="_blank" rel="noopener" href="https://translate.google.com/translate?sl=en&tl='+encodeURIComponent(l)+'&u='+encodeURIComponent(u.toString())+'">Machine translation ('+l.toUpperCase()+') ↗</a>';
    n.hidden=false;
  }
  document.addEventListener('qcf-lang',note);
  // app.js apply() runs on DOMContentLoaded; call note after that so ?lang=fr/de/… shows the MT link.
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(note,0)});
  }else{
    setTimeout(note,0);
  }


  var form=document.getElementById('brief-request-form');
  if(!form)return;
  var status=document.getElementById('brief-request-status');
  function say(kind, zh, en){
    if(!status)return;
    status.hidden=false;
    status.className='form-status small '+(kind||'');
    status.textContent=lang()==='zh'?zh:en;
  }
  function mailtoBody(p){
    return 'I would like to receive the full PDF of this QCF brief. / 我想索取该期 QCF 简报全文（PDF）。\n\n'
      + 'Brief: '+p.brief+'\nDate: '+p.date+'\nCategory: '+p.cat+'\nPage: '+p.page+'\n'
      + 'Name: '+(p.name||'(not provided)')+'\nEmail: '+p.email+'\n'
      + 'I agree to the Privacy Policy (https://qcf.org.cn/privacy.html) and to receiving this brief by email.';
  }
  function openMailto(p){
    var subj='Request full text / 索取全文: '+p.brief;
    location.href='mailto:'+FOUNDERS+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(mailtoBody(p));
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var email=(form.email.value||'').trim();
    var name=(form.name.value||'').trim();
    var consent=form.consent.checked;
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      say('err','请填写有效的电子邮箱。','Please enter a valid email address.');
      form.email.focus();return;
    }
    if(!consent){
      say('err','请先阅读并勾选同意隐私政策。','Please read and agree to the privacy policy.');
      form.consent.focus();return;
    }
    var isZh=lang()==='zh';
    var payload={
      email:email,name:name,consent:true,
      brief:isZh?(form.dataset.briefTitleZh||''):(form.dataset.briefTitleEn||''),
      date:form.dataset.briefDate||'',
      cat:form.dataset.briefCat||'',
      page:location.href
    };
    if(!FORM_ENDPOINT){
      say('ok','正在打开您的邮件程序。请发送预填的申请后，我们将把全文 PDF 发到您的邮箱。','Your email app will open with a pre-filled request. After you send it, we will email you the full PDF.');
      openMailto(payload);
      return;
    }
    fetch(FORM_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    }).then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      say('ok','已收到您的申请。完整简报 PDF 将发送至您填写的邮箱。','Your request has been received. The full brief PDF will be sent to the email you provided.');
      form.reset();
    }).catch(function(){
      say('err','在线提交暂时不可用，已改为打开邮件程序。请发送预填的申请。','Online submission is unavailable; your email app will open with a pre-filled request. Please send it.');
      openMailto(payload);
    });
  });
})();
