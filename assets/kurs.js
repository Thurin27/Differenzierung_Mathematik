/* Mathe-Aufbaukurs Umwelttechnik – gemeinsame Bausteine
   Stellt window.K bereit:
   - Formelbausteine (K.I, K.fr, K.sq, K.F, …) und Zahlformat (K.nf, K.fmt, K.rnd)
   - K.module(cfg): Niveau-Wahl, Schritt-für-Schritt-Beispiele, Trainer, Rechenaufgaben, Lernstand
   - K.overview(): Lernstand aller Module auf der Startseite
   Fortschritt liegt nur im localStorage des Browsers (Schlüssel "mak-…"). */
(function(){
"use strict";
const K=window.K={};
const $=(s,root)=>(root||document).querySelector(s);
const LV={B:'Basis',S:'Standard',V:'Vertiefung'};
K.LV=LV;

/* ---------- Speicher ---------- */
K.load=id=>{try{return JSON.parse(localStorage.getItem('mak-'+id)||'{}')||{}}catch(e){return{}}};
K.save=(id,o)=>{try{localStorage.setItem('mak-'+id,JSON.stringify(o))}catch(e){}};

/* ---------- Zahlen ---------- */
const NNBSP=' ';
const grp=i=>i.length>4?i.replace(/\B(?=(\d{3})+(?!\d))/g,NNBSP):i;
function split(s){const p=s.split('.');return grp(p[0])+(p[1]?','+p[1]:'')}
K.fmt=(x,dc)=>{const s=Math.abs(x).toFixed(dc);return(x<0&&+s!==0?'−':'')+split(s)};
K.nf=x=>{x=+(+x).toFixed(8);let s=Math.abs(x).toString();if(s.includes('e'))s=Math.abs(x).toFixed(10).replace(/0+$/,'');return(x<0?'−':'')+split(s)};
K.dcOf=x=>{for(let d=0;d<=6;d++){if(Math.abs(+x.toFixed(d)-x)<1e-9)return d}return 6};
K.rnd=(lo,hi,st)=>{const n=Math.round((hi-lo)/st);return +(lo+st*Math.floor(Math.random()*(n+1))).toFixed(6)};
K.pick=a=>a[Math.floor(Math.random()*a.length)];
K.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
K.parse=s=>{
  s=String(s).trim().replace(/[\s  ]/g,'').replace('−','-');
  if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
  else if(/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
  if(!/^-?\d*\.?\d+$/.test(s))return NaN;
  return parseFloat(s);
};

/* ---------- Formelbausteine ---------- */
K.I=(s,sub)=>`<i>${s}</i>`+(sub?`<sub>${sub}</sub>`:'');
K.fr=(n,d)=>`<span class="fr"><span>${n}</span><span>${d}</span></span>`;
K.sq=x=>`<span class="sq"><span class="rad">√</span><span class="sqc">${x}</span></span>`;
K.F=(...p)=>`<span class="f">${p.join('')}</span>`;
K.M=' · ';K.MI=' − ';K.PL=' + ';K.EQ=' = ';
K.u=s=>`<span class="uu">&#8202;${s}</span>`;
K.q=(x,unit)=>K.nf(x)+K.u(unit);
K.sqr=x=>x+'²';
K.res=(x,dc,unit)=>`<span class="result">${K.fmt(x,dc)}${unit?K.u(unit):''}</span>`;

/* Hilfsfunktion für Umstell-Aufgaben im Trainer */
K.umstell=(L,n,lhs,rhs,x,ok,w,h)=>({L,n,prompt:K.F(lhs,K.EQ,rhs),ask:`Stelle nach ${x} um.`,ok:K.F(x,K.EQ,ok),w:w.map(o=>K.F(x,K.EQ,o)),h});

/* Rechenweg-Schema als HTML */
K.schema=rows=>`<dl class="schema">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

/* ---------- Modul ---------- */
K.module=function(cfg){
  const need=Object.assign({T:5,R:3},cfg.need);
  const raw=K.load(cfg.id);
  const st={lvl:raw.lvl||K.load('global').lvl||'B',T:Object.assign({B:0,S:0,V:0},raw.T),R:Object.assign({B:0,S:0,V:0},raw.R)};
  const save=()=>K.save(cfg.id,st);
  const hooks=[];

  /* Niveau-Wahl */
  const segHost=$('[data-k="niveau"]');
  if(segHost){
    segHost.innerHTML=`<div class="seg" role="group" aria-label="Niveau wählen">${['B','S','V'].map(L=>`<button id="lv${L}" data-l="${L}" aria-pressed="false">${LV[L]}</button>`).join('')}</div>`;
    segHost.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setLvl(b.dataset.l)));
  }
  function setLvl(L){
    st.lvl=L;save();K.save('global',{lvl:L});
    if(segHost)segHost.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===L));
    hooks.forEach(f=>f(L));
  }

  /* Schritt für Schritt */
  const stHost=$('[data-k="stepper"]');
  if(stHost&&cfg.examples){
    const keys=Object.keys(cfg.examples);
    stHost.innerHTML=`<div class="stepper"><div class="tabs" role="tablist" aria-label="Beispiel wählen">${keys.map(k=>`<button role="tab" data-ex="${k}" aria-selected="false">${LV[k]}: ${cfg.examples[k].tab}</button>`).join('')}</div>
      <p class="intro"></p><ol class="steps"></ol>
      <div class="ctl"><button class="btn" data-a="next">Nächster Schritt</button><button class="btn ghost" data-a="all">Alle zeigen</button><button class="btn ghost" data-a="reset">Von vorn</button></div></div>`;
    let key=keys[0],shown=1;
    const render=()=>{
      const ex=cfg.examples[key];
      $('.intro',stHost).innerHTML=ex.intro;
      $('.steps',stHost).innerHTML=ex.s.slice(0,shown).map(s=>`<li><div class="eqn">${s.e}</div><div class="opn">${s.o||''}</div><div class="why">${s.w}</div></li>`).join('');
      $('[data-a="next"]',stHost).disabled=shown>=ex.s.length;
      stHost.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.ex===key));
    };
    const show=k=>{key=k;shown=1;render()};
    stHost.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.ex)));
    $('[data-a="next"]',stHost).onclick=()=>{shown++;render()};
    $('[data-a="all"]',stHost).onclick=()=>{shown=cfg.examples[key].s.length;render()};
    $('[data-a="reset"]',stHost).onclick=()=>{shown=1;render()};
    hooks.push(L=>{if(cfg.examples[L])show(L)});
  }

  /* Trainer */
  const tHost=$('[data-k="trainer"]');
  if(tHost&&cfg.trainer){
    tHost.innerHTML=`<div class="card"><div class="head"><span class="lvl"></span><span class="counter"></span></div>
      <div><div class="eyebrow t-name"></div><div class="task-f t-prompt"></div><p class="t-ask"></p></div>
      <div class="opts"></div><div class="t-fb" hidden></div>
      <div class="row"><button class="btn t-next">${cfg.trainerNext||'Nächste Aufgabe'}</button></div></div>`;
    let bag=[],cur=null,done=false,miss=false;
    const cnt=()=>{$('.counter',tHost).textContent=`${Math.min(st.T[st.lvl],need.T)} / ${need.T} richtig`};
    const next=()=>{
      const L=st.lvl,pool=cfg.trainer.filter(x=>x.L===L);
      if(!bag.length||bag[0].L!==L)bag=K.shuffle(pool);
      cur=bag.shift();if(!bag.length)bag=K.shuffle(pool);
      done=false;miss=false;
      const lv=$('.lvl',tHost);lv.className='lvl '+L;lv.textContent=LV[L];
      $('.t-name',tHost).textContent=cur.n;$('.t-prompt',tHost).innerHTML=cur.prompt;$('.t-ask',tHost).innerHTML=cur.ask||'';
      const box=$('.opts',tHost);box.innerHTML='';
      K.shuffle([{h:cur.ok,ok:true},...cur.w.map(w=>({h:w,ok:false}))]).forEach(o=>{
        const b=document.createElement('button');b.className='opt';b.innerHTML=o.h;b.onclick=()=>pick(b,o.ok);box.appendChild(b);
      });
      $('.t-fb',tHost).hidden=true;cnt();
    };
    const pick=(b,ok)=>{
      if(done)return;const fb=$('.t-fb',tHost);fb.hidden=false;
      if(ok){
        done=true;b.classList.add('right');tHost.querySelectorAll('.opt').forEach(o=>o.disabled=true);
        if(!miss){st.T[st.lvl]++;save();renderProg()}
        fb.className='t-fb fb ok';fb.innerHTML=`<div><strong>Richtig.</strong> ${cur.h}${miss?' <span class="small">(Zählt nur, wenn der erste Versuch sitzt.)</span>':''}</div>`;cnt();
      }else{
        miss=true;b.classList.add('wrong');b.disabled=true;
        fb.className='t-fb fb no';fb.innerHTML=`<div><strong>Noch nicht.</strong> Tipp: ${cur.h}</div>`;
      }
    };
    $('.t-next',tHost).onclick=next;
    hooks.push(()=>{bag=[];next()});
  }

  /* Rechenaufgaben */
  const rHost=$('[data-k="rechnen"]');
  if(rHost&&cfg.tasks){
    rHost.innerHTML=`<div class="card"><div class="head"><div class="row"><span class="lvl"></span><span class="tag"></span></div><span class="counter"></span></div>
      <div style="display:grid;gap:8px"><h3 class="r-title"></h3><p class="r-text"></p></div>
      <form class="ans" autocomplete="off"><label class="r-want" for="${cfg.id}-in"></label><span class="f">=</span>
        <input id="${cfg.id}-in" inputmode="decimal" placeholder="Ergebnis"><span class="unit"></span><button class="btn" type="submit">Prüfen</button></form>
      <p class="small r-round"></p><div class="hints"></div><div class="r-fb" hidden></div>
      <div class="row"><button class="btn ghost r-hint">Tipp 1 zeigen</button><button class="btn ghost r-sol">Lösung zeigen</button><button class="btn r-new">Neue Aufgabe</button></div></div>`;
    let bag=[],cur=null,hints=0,state='open';
    const inp=$('input',rHost);
    const cnt=()=>{$('.counter',rHost).textContent=`${Math.min(st.R[st.lvl],need.R)} / ${need.R} gelöst`};
    const hintList=()=>cur.steps.concat([['Eingesetzt',cur.ein]]).slice(0,3);
    const next=()=>{
      const L=st.lvl,pool=cfg.tasks.filter(x=>x.L===L);
      if(!bag.length||bag[0].L!==L)bag=K.shuffle(pool);
      const g=bag.shift();if(!bag.length)bag=K.shuffle(pool);
      cur=g.g();hints=0;state='open';
      const lv=$('.lvl',rHost);lv.className='lvl '+L;lv.textContent=LV[L];
      $('.tag',rHost).textContent=cur.tag;$('.r-title',rHost).textContent=cur.ti;$('.r-text',rHost).innerHTML=cur.tx;
      $('.r-want',rHost).innerHTML=`<span class="f">${cur.x}</span>`;$('.unit',rHost).innerHTML=cur.un;
      $('.r-round',rHost).textContent=cur.exact?'Gib das Ergebnis genau an (ohne Runden). Dezimalzeichen: Komma.':`Runde auf ${cur.dc===0?'eine ganze Zahl':cur.dc+' Nachkommastelle'+(cur.dc>1?'n':'')}. Dezimalzeichen: Komma.`;
      inp.value='';inp.disabled=false;$('.hints',rHost).innerHTML='';$('.r-fb',rHost).hidden=true;
      const hb=$('.r-hint',rHost);hb.disabled=false;hb.textContent='Tipp 1 zeigen';$('.r-sol',rHost).disabled=false;cnt();
    };
    const solution=(head,cls)=>{
      const fb=$('.r-fb',rHost);fb.hidden=false;fb.className='r-fb fb '+cls;
      fb.innerHTML=`<div>${head}</div>`+K.schema([['Gegeben',cur.geg],['Gesucht',`<span class="f">${cur.x}</span> in ${cur.un}`],...cur.steps,['Rechnung',cur.s],['Antwort',cur.satz]]);
      inp.disabled=true;$('.r-hint',rHost).disabled=true;$('.r-sol',rHost).disabled=true;
    };
    $('form',rHost).addEventListener('submit',e=>{
      e.preventDefault();if(state!=='open')return;
      const x=K.parse(inp.value),fb=$('.r-fb',rHost);
      if(isNaN(x)){fb.hidden=false;fb.className='r-fb fb info';fb.innerHTML='<div>Gib eine Zahl ein, zum Beispiel 1,25.</div>';return}
      const dc=cur.exact?K.dcOf(cur.a):cur.dc;
      const tol=cur.exact?Math.max(Math.abs(cur.a)*1e-6,1e-9):Math.max(Math.abs(cur.a)*0.01,0.501*Math.pow(10,-dc));
      if(Math.abs(x-cur.a)<=tol){
        state='solved';st.R[st.lvl]++;save();renderProg();cnt();
        solution(`<strong>Richtig${hints?` (mit ${hints} Tipp${hints>1?'s':''})`:''}.</strong> Vergleiche mit deinem Rechenweg im Heft:`,'ok');
      }else{
        let msg='Prüfe deinen Rechenweg Schritt für Schritt.';
        const r=x/cur.a;
        for(const f of [10,100,1000,3600,60,24,1e6]){
          if(Math.abs(r/f-1)<0.02||Math.abs(r*f-1)<0.02){msg=`Dein Ergebnis ist um den Faktor ${K.nf(f)} verschoben. Prüfe die Einheiten und die Umrechnungszahl.`;break}
        }
        if(Math.abs(r-1)<0.05&&!cur.exact)msg='Sehr knapp daneben. Prüfe das Runden – runde erst am Ende.';
        fb.hidden=false;fb.className='r-fb fb no';fb.innerHTML=`<div><strong>Noch nicht.</strong> ${msg}</div>`;
      }
    });
    $('.r-hint',rHost).onclick=()=>{
      const hl=hintList();if(hints>=hl.length)return;
      const d=document.createElement('div');d.className='hint';d.innerHTML=`<b>Tipp ${hints+1} · ${hl[hints][0]}</b>${hl[hints][1]}`;
      $('.hints',rHost).appendChild(d);hints++;
      const hb=$('.r-hint',rHost);if(hints>=hl.length){hb.disabled=true;hb.textContent='Alle Tipps gezeigt'}else hb.textContent=`Tipp ${hints+1} zeigen`;
    };
    $('.r-sol',rHost).onclick=()=>{state='shown';solution('<strong>Lösung.</strong> Diese Aufgabe zählt nicht – probiere gleich eine neue.','info')};
    $('.r-new',rHost).onclick=next;
    hooks.push(()=>{bag=[];next()});
  }

  /* Lernstand */
  const pHost=$('[data-k="stand"]');
  function code(){return K.moduleCode(cfg.id,cfg.nr,st,need)}
  function renderProg(){
    if(!pHost)return;
    $('.prog',pHost).innerHTML=['B','S','V'].map(L=>{
      const tp=Math.min(st.T[L],need.T),rp=Math.min(st.R[L],need.R),ok=tp>=need.T&&rp>=need.R;
      return `<div class="prow" data-l="${L}"><div class="lvlc"><span class="lvl ${L}">${LV[L]}</span></div>
        <div class="meter">Trainer ${tp}/${need.T}<div class="trk"><div class="fill" style="width:${tp/need.T*100}%"></div></div></div>
        <div class="meter">Rechnen ${rp}/${need.R}<div class="trk"><div class="fill" style="width:${rp/need.R*100}%"></div></div></div>
        <div class="done ${ok?'yes':''}">${ok?'geschafft':'offen'}</div></div>`}).join('');
    $('.code',pHost).textContent=code();
  }
  if(pHost){
    pHost.innerHTML=`<div class="prog"></div>
      <div style="display:grid;gap:8px"><div class="eyebrow">Kontrollcode für den Laufzettel</div>
      <div class="row"><div class="code"></div><button class="btn ghost p-copy">Kopieren</button></div></div>
      <div class="confirm p-reset"></div>`;
    K.copyBtn($('.p-copy',pHost),$('.code',pHost));
    const resetUI=()=>{
      const box=$('.p-reset',pHost);
      box.innerHTML='<button class="btn ghost">Lernstand dieses Moduls zurücksetzen</button>';
      box.firstChild.onclick=()=>{
        box.innerHTML='<span>Wirklich alles auf null setzen?</span><button class="btn">Ja, zurücksetzen</button><button class="btn ghost">Abbrechen</button>';
        const bs=box.querySelectorAll('button');
        bs[0].onclick=()=>{st.T={B:0,S:0,V:0};st.R={B:0,S:0,V:0};save();renderProg();setLvl(st.lvl);resetUI()};
        bs[1].onclick=resetUI;
      };
    };
    resetUI();renderProg();
  }
  setLvl(st.lvl);
};

K.moduleCode=(id,nr,st,need)=>`M${nr} · `+['B','S','V'].map(L=>`${L} ${Math.min(st.T[L]||0,9)}${Math.min(st.R[L]||0,9)}${((st.T[L]||0)>=need.T&&(st.R[L]||0)>=need.R)?'+':'-'}`).join(' · ');

K.copyBtn=(btn,el)=>{
  btn.onclick=()=>{
    const txt=el.textContent;
    const ok=()=>{btn.textContent='Kopiert';setTimeout(()=>btn.textContent='Kopieren',1500)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)};
    try{navigator.clipboard.writeText(txt).then(ok,sel)}catch(e){sel()}
  };
};

/* ---------- Übersicht (Startseite) ---------- */
K.overview=function(mods){
  const parts=[];
  mods.forEach(m=>{
    const host=document.querySelector(`[data-mod="${m.id}"] .st`);
    if(!host)return;
    if(m.id==='rw'){
      const s=K.load('rw'),n=(s.solved||[]).length;
      host.insertAdjacentHTML('beforeend',`<span class="pill ${n>=m.need?'ok':''}">Detektiv ${Math.min(n,m.need)}/${m.need}</span>`);
      parts.push(`RW ${n}/${m.need}`);return;
    }
    const st=Object.assign({T:{},R:{}},K.load(m.id)),need={T:5,R:3};
    ['B','S','V'].forEach(L=>{
      const ok=(st.T[L]||0)>=need.T&&(st.R[L]||0)>=need.R;
      host.insertAdjacentHTML('beforeend',`<span class="pill ${ok?'ok':''}">${LV[L]}${ok?' ✓':''}</span>`);
    });
    parts.push(K.moduleCode(m.id,m.nr,{T:st.T,R:st.R},need));
  });
  const c=document.getElementById('gesamtcode');
  if(c){c.textContent=parts.join('  |  ');K.copyBtn(document.getElementById('gesamtcopy'),c)}
};
})();
