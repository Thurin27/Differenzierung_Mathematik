/* Mathe-Aufbaukurs Umwelttechnik – gemeinsame Bausteine
   Stellt window.K bereit:
   - Formelbausteine (K.I, K.fr, K.sq, K.F, …) und Zahlformat (K.nf, K.fmt, K.rnd)
   - K.module(cfg): Niveau-Wahl, Schritt-für-Schritt-Beispiele, Trainer, Rechenaufgaben, Lernstand
   - K.overview(): Status-Chips auf der Startseite, K.progressPage(): Seite „Mein Fortschritt“
   Fortschritt liegt nur im localStorage des Browsers (Schlüssel "mak-…"). */
(function(){
"use strict";
const K=window.K={};
const $=(s,root)=>(root||document).querySelector(s);
const LV={B:'Basis',S:'Standard',V:'Vertiefung'};
K.LV=LV;

/* ---------- Module (für Startseite und Fortschrittsseite) ---------- */
K.MODS=[
  {id:'rw',nr:0,href:'rechenweg.html',t:'Der Rechenweg',p:true,rw:true},
  {id:'m1',nr:1,href:'modul-01.html',t:'Zahlen & Rechenregeln'},
  {id:'m2',nr:2,href:'modul-02.html',t:'Einheiten umrechnen',p:true},
  {id:'m3',nr:3,href:'modul-03.html',t:'Dreisatz, Prozent, Verhältnisse'},
  {id:'m4',nr:4,href:'modul-04.html',t:'Formeln umstellen',p:true},
  {id:'m5',nr:5,href:'modul-05.html',t:'Mit Formeln rechnen',p:true},
  {id:'m6',nr:6,href:'modul-06.html',t:'Flächen'},
  {id:'m7',nr:7,href:'modul-07.html',t:'Volumen & Masse',p:true},
  {id:'m8',nr:8,href:'modul-08.html',t:'Diagramme lesen'},
  {id:'m9',nr:9,href:'modul-09.html',t:'Die Berufsformeln'},
  {id:'m10',nr:10,href:'modul-10.html',t:'Funktionen (Vertiefung)'}
];
K.NEED={T:5,R:3};K.RW_NEED=4;
/* Status einer Niveaustufe: offen · angefangen · geschafft */
K.status=(st,L)=>{const t=(st.T||{})[L]||0,r=(st.R||{})[L]||0;return t>=K.NEED.T&&r>=K.NEED.R?'geschafft':(t||r)?'angefangen':'offen'};
K.today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
K.dDE=iso=>iso?iso.slice(8,10)+'.'+iso.slice(5,7)+'.':'';

/* ---------- Diagramme (SVG, Farben aus dem Theme) ----------
   K.plot({x0,x1,dx,y0,y1,dy,mx,my,xl,yl,w,h,series:[{f|pts,color,width,dash,label}],points:[{x,y,label}],guides:[{x,y}],hl:[{y}],vl:[{x}]})
   mx/my: Anzahl Kästchen je Hauptteilung (Feinraster) */
let plotId=0;
K.plot=function(o){
  const W=o.w||600,H=o.h||320,L=58,R=18,T=16,B=48,pw=W-L-R,ph=H-T-B,id='pc'+(++plotId);
  const X=x=>L+(x-o.x0)/(o.x1-o.x0)*pw, Y=y=>T+ph-(y-o.y0)/(o.y1-o.y0)*ph;
  const eps=1e-9,lines=[],txt=[];
  const mx=o.mx||5,my=o.my||5;
  for(let x=o.x0;x<=o.x1+eps;x+=o.dx/mx){const maj=Math.abs(Math.round((x-o.x0)/o.dx)*o.dx-(x-o.x0))<eps*1e3;
    lines.push(`<line x1="${X(x).toFixed(1)}" y1="${T}" x2="${X(x).toFixed(1)}" y2="${T+ph}" stroke="var(--${maj?'line':'grid'})" stroke-width="${maj?1:.6}"/>`);
    if(maj)txt.push(`<text x="${X(x).toFixed(1)}" y="${T+ph+18}" text-anchor="middle" font-size="12.5" fill="var(--muted)">${K.nf(+x.toFixed(6))}</text>`)}
  for(let y=o.y0;y<=o.y1+eps;y+=o.dy/my){const maj=Math.abs(Math.round((y-o.y0)/o.dy)*o.dy-(y-o.y0))<eps*1e3;
    lines.push(`<line x1="${L}" y1="${Y(y).toFixed(1)}" x2="${L+pw}" y2="${Y(y).toFixed(1)}" stroke="var(--${maj?'line':'grid'})" stroke-width="${maj?1:.6}"/>`);
    if(maj)txt.push(`<text x="${L-7}" y="${(Y(y)+4).toFixed(1)}" text-anchor="end" font-size="12.5" fill="var(--muted)">${K.nf(+y.toFixed(6))}</text>`)}
  const ser=(o.series||[]).map(sr=>{
    let pts=sr.pts;
    if(sr.f){pts=[];const n=sr.n||240,a=sr.from??o.x0,b=sr.to??o.x1;for(let i=0;i<=n;i++){const x=a+(b-a)*i/n,y=sr.f(x);if(isFinite(y))pts.push([x,y])}}
    const d=pts.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
    const lab=sr.label?`<text x="${(X(sr.lx??pts[pts.length-1][0])+(sr.ldx||-4)).toFixed(1)}" y="${(Y(sr.ly??pts[pts.length-1][1])+(sr.ldy||-8)).toFixed(1)}" text-anchor="${sr.anchor||'end'}" font-size="13" font-weight="600" fill="${sr.color||'var(--blue)'}">${sr.label}</text>`:'';
    return `<path d="${d}" fill="none" stroke="${sr.color||'var(--blue)'}" stroke-width="${sr.width||2.6}" ${sr.dash?`stroke-dasharray="${sr.dash}"`:''} stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${id})"/>`+lab;
  }).join('');
  const hl=(o.hl||[]).map(h=>`<line x1="${L}" y1="${Y(h.y).toFixed(1)}" x2="${L+pw}" y2="${Y(h.y).toFixed(1)}" stroke="${h.color||'var(--lv)'}" stroke-width="1.6" stroke-dasharray="6 4"/>`+(h.label?`<text x="${L+6}" y="${(Y(h.y)-6).toFixed(1)}" text-anchor="start" font-size="12.5" fill="${h.color||'var(--lv)'}">${h.label}</text>`:'')).join('');
  const vl=(o.vl||[]).map(v=>`<line x1="${X(v.x).toFixed(1)}" y1="${T}" x2="${X(v.x).toFixed(1)}" y2="${T+ph}" stroke="${v.color||'var(--lv)'}" stroke-width="1.6" stroke-dasharray="6 4"/>`).join('');
  const gd=(o.guides||[]).map(g=>`<path d="M${X(g.x).toFixed(1)} ${T+ph}V${Y(g.y).toFixed(1)}H${L}" fill="none" stroke="var(--ok)" stroke-width="1.6" stroke-dasharray="5 4"/>`).join('');
  const pt=(o.points||[]).map(p=>`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="5" fill="${p.color||'var(--navy)'}" stroke="var(--surface)" stroke-width="1.5"/>`+(p.label?`<text x="${(X(p.x)+(p.dx??8)).toFixed(1)}" y="${(Y(p.y)+(p.dy??-8)).toFixed(1)}" font-size="13" font-weight="600" text-anchor="${p.anchor||'start'}" fill="${p.color||'var(--navy)'}">${p.label}</text>`:'')).join('');
  return `<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${(o.aria||'Diagramm').replace(/"/g,'')}">
    <defs><clipPath id="${id}"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs>
    <rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="var(--surface)"/>${lines.join('')}
    <line x1="${L}" y1="${T+ph}" x2="${L+pw}" y2="${T+ph}" stroke="var(--ink)" stroke-width="1.4"/><line x1="${L}" y1="${T}" x2="${L}" y2="${T+ph}" stroke="var(--ink)" stroke-width="1.4"/>
    ${txt.join('')}${hl}${vl}${ser}${gd}${pt}
    <text x="${L+pw}" y="${H-8}" text-anchor="end" font-size="13.5" fill="var(--ink)">${o.xl||''}</text>
    <text x="14" y="${T+ph/2}" text-anchor="middle" font-size="13.5" fill="var(--ink)" transform="rotate(-90 14 ${T+ph/2})">${o.yl||''}</text></svg>`;
};

/* ---------- Speicher ---------- */
K.load=id=>{try{return JSON.parse(localStorage.getItem('mak-'+id)||'{}')||{}}catch(e){return{}}};
K.save=(id,o)=>{try{localStorage.setItem('mak-'+id,JSON.stringify(o))}catch(e){}};

/* ---------- Zahlen ---------- */
const NNBSP=' ';
const grp=i=>i.length>4?i.replace(/\B(?=(\d{3})+(?!\d))/g,NNBSP):i;
function split(s){const p=s.split('.');return grp(p[0])+(p[1]?','+p[1]:'')}
/* Rundungsregel des Kurses: 4 signifikante Stellen.
   K.r4(x)  rundet auf n signifikante Stellen (Zahl)
   K.fmt(x) formatiert mit 4 signifikanten Stellen; geht der Wert genau auf (z. B. 2,5), ohne angehängte Nullen;
            ab 1000 als ganze Zahl (123 576 statt 123 600)
   K.fix(x,dc) formatiert mit fester Zahl Nachkommastellen (nur für Geldbeträge) */
K.r4=(x,n)=>{n=n||4;if(!x)return 0;const sg=x<0?-1:1,a=Math.abs(x),e=Math.floor(Math.log10(a)),f=Math.pow(10,n-1-e);
  const r=Math.round(a*f)/f;return sg*+r.toPrecision(n)};
K.fix=(x,dc)=>{const s=Math.abs(x).toFixed(dc);return(x<0&&+s!==0?'−':'')+split(s)};
K.fmt=x=>{
  if(!x)return '0';
  if(Math.abs(x)>=999.95)return(x<0?'−':'')+split(String(Math.round(Math.abs(x))));
  const r=K.r4(x),a=Math.abs(r),e=Math.floor(Math.log10(a)+1e-12);
  let s=a.toFixed(Math.max(0,3-e));
  if(Math.abs(r-x)<=Math.abs(x)*1e-9&&s.includes('.'))s=s.replace(/0+$/,'').replace(/\.$/,'');
  return(r<0?'−':'')+split(s);
};
/* Anzahl signifikanter Stellen einer Eingabe; Endnullen ganzer Zahlen zählen nicht (mehrdeutig) */
K.sigCount=s=>{
  s=String(s).trim().replace(/[\s\u202F\u00A0]/g,'').replace(/[−-]/g,'');
  s=s.replace(/[·*x×]10\^?-?\d+$/i,'').replace(/e[+-]?\d+$/i,'');
  if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
  else if(/^[1-9]\d{0,2}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
  const d=s.includes('.')?s.replace('.','').replace(/^0+/,''):s.replace(/^0+/,'').replace(/0+$/,'');
  return d.length;
};
K.nf=x=>{x=+(+x).toFixed(8);let s=Math.abs(x).toString();if(s.includes('e'))s=Math.abs(x).toFixed(10).replace(/0+$/,'');return(x<0?'−':'')+split(s)};
K.dcOf=x=>{for(let d=0;d<=6;d++){if(Math.abs(+x.toFixed(d)-x)<1e-9)return d}return 6};
K.rnd=(lo,hi,st)=>{const n=Math.round((hi-lo)/st);return +(lo+st*Math.floor(Math.random()*(n+1))).toFixed(6)};
K.pick=a=>a[Math.floor(Math.random()*a.length)];
K.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
K.parse=s=>{
  s=String(s).trim().replace(/[\s  ]/g,'').replace(/−/g,'-');
  /* wissenschaftliche Schreibweise: 2,4·10^5 · 2,4*10^-3 · 2,4x10^5 · 2,4E5 */
  s=s.replace(/[·*x×]10\^?(-?\d+)$/i,'e$1').replace(/E/g,'e');
  if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
  else if(/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
  if(!/^-?\d*\.?\d+(e[+-]?\d+)?$/.test(s))return NaN;
  return parseFloat(s);
};

/* ---------- Formelbausteine ---------- */
K.I=(s,sub)=>`<i>${s}</i>`+(sub?`<sub>${sub}</sub>`:'');
K.fr=(n,d)=>`<span class="fr"><span>${n}</span><span>${d}</span></span>`;
K.sq=x=>`<span class="sq"><span class="rad">√</span><span class="sqc">${x}</span></span>`;
K.F=(...p)=>`<span class="f">${p.join('')}</span>`;
K.M=' · ';K.MI=' − ';K.PL=' + ';K.EQ=' = ';
K.u=s=>`<span class="uu">&#8239;${s}</span>`;
K.q=(x,unit)=>K.nf(x)+K.u(unit);
K.sqr=x=>x+'²';
K.res=(x,dc,unit)=>`<span class="result">${K.fmt(x)}${unit?K.u(unit):''}</span>`;
K.resFix=(x,dc,unit)=>`<span class="result">${K.fix(x,dc)}${unit?K.u(unit):''}</span>`;

/* Hilfsfunktion für Umstell-Aufgaben im Trainer */
K.umstell=(L,n,lhs,rhs,x,ok,w,h)=>({L,n,prompt:K.F(lhs,K.EQ,rhs),ask:`Stelle nach ${x} um.`,ok:K.F(x,K.EQ,ok),w:w.map(o=>K.F(x,K.EQ,o)),h});

/* Rechenweg-Schema als HTML */
K.schema=rows=>`<dl class="schema">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

/* ---------- Modul ---------- */
K.module=function(cfg){
  const need=Object.assign({T:5,R:3},cfg.need);
  const raw=K.load(cfg.id);
  const st={lvl:raw.lvl||K.load('global').lvl||'B',T:Object.assign({B:0,S:0,V:0},raw.T),R:Object.assign({B:0,S:0,V:0},raw.R),D:Object.assign({B:{},S:{},V:{}},raw.D)};
  /* Datum merken: begonnen (erster Erfolg) und geschafft */
  const save=()=>{['B','S','V'].forEach(L=>{const s=K.status(st,L);st.D[L]=st.D[L]||{};
      if(s!=='offen'&&!st.D[L].b)st.D[L].b=K.today();if(s==='geschafft'&&!st.D[L].g)st.D[L].g=K.today()});
    K.save(cfg.id,st)};
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
      $('.r-round',rHost).innerHTML=cur.tol!=null?(cur.tolText||`Lies so genau ab, wie es geht. Erlaubte Abweichung: ±${K.nf(cur.tol)} ${cur.un}.`)
        :cur.sig?'Gib die gerundete Zahl ein. Dezimalzeichen: Komma.'
        :cur.exact?'Das Ergebnis geht genau auf – gib es vollständig an. Dezimalzeichen: Komma.'
        :cur.fix?`Geldbeträge rundest du auf ${cur.dc} Nachkommastellen (Cent). Dezimalzeichen: Komma.`
        :'Gib das Ergebnis mit <strong>4 signifikanten Stellen</strong> an (<a href="modul-01.html#runden">Regel in Modul 1</a>) – genauer ist auch in Ordnung. Dezimalzeichen: Komma.';
      inp.value='';inp.disabled=false;$('.hints',rHost).innerHTML='';$('.r-fb',rHost).hidden=true;
      const hb=$('.r-hint',rHost);hb.disabled=false;hb.textContent='Tipp 1 zeigen';$('.r-sol',rHost).disabled=false;cnt();
    };
    const solution=(head,cls)=>{
      const fb=$('.r-fb',rHost);fb.hidden=false;fb.className='r-fb fb '+cls;
      fb.innerHTML=`<div>${head}</div>`+K.schema([['Gegeben',cur.geg],['Gesucht',`<span class="f">${cur.x}</span>${cur.un?' in '+cur.un:''}`],...cur.steps,['Rechnung',cur.s],['Antwort',cur.satz]]);
      inp.disabled=true;$('.r-hint',rHost).disabled=true;$('.r-sol',rHost).disabled=true;
    };
    $('form',rHost).addEventListener('submit',e=>{
      e.preventDefault();if(state!=='open')return;
      const x=K.parse(inp.value),fb=$('.r-fb',rHost);
      if(isNaN(x)){fb.hidden=false;fb.className='r-fb fb info';fb.innerHTML='<div>Gib eine Zahl ein, zum Beispiel 1,25 oder 2,4·10^5.</div>';return}
      const same=(p,q)=>Math.abs(p-q)<=Math.max(Math.abs(q)*1e-10,1e-12);
      const nd=K.sigCount(inp.value),t4=K.r4(cur.a),ulp=Math.pow(10,Math.floor(Math.log10(Math.abs(t4))+1e-12)-3);
      let ok=false,hint='';
      if(cur.sig){
        const big=Math.abs(cur.raw)>=999.95,maxd=big?String(Math.round(Math.abs(cur.raw))).replace(/0+$/,'').length:4;
        ok=(same(x,cur.a)||(big&&same(x,K.r4(cur.raw))))&&nd<=Math.max(4,maxd);
        if(!ok){
          const ar=Math.abs(cur.raw),e=Math.floor(Math.log10(ar)),f=big?1:Math.pow(10,3-e),tr=Math.sign(cur.raw)*Math.floor(ar*f)/f;
          if(same(x,cur.a))hint=big?'Der Wert stimmt, aber die Nachkommastellen kannst du bei so großen Zahlen weglassen.':'Der Wert stimmt, aber du hast zu viele Stellen angegeben. Vier signifikante Stellen reichen.';
          else if(same(x,tr))hint='Du hast nach der vierten Stelle abgeschnitten. Schau dir die fünfte signifikante Stelle an: Ist sie 5 oder größer, wird aufgerundet.';
          else if(nd<4&&Math.abs(x-cur.raw)<=Math.abs(cur.raw)*0.01)hint='Zu stark gerundet – es sollen vier signifikante Stellen sein.';
          else hint='Zähle ab der ersten Ziffer, die keine Null ist. Führende Nullen zählen nicht mit.';
        }
      }else if(cur.tol!=null){
        /* Ablesen aus Diagrammen: feste Toleranz */
        ok=Math.abs(x-cur.a)<=cur.tol*1.0001;
        if(!ok&&Math.abs(x-cur.a)<=cur.tol*3)hint='Fast – lies noch einmal genau ab. Wie viel ist ein Kästchen auf der Achse wert?';
      }else if(cur.exact){
        /* geht genau auf: genauer Wert oder nach der Rundungsregel */
        ok=same(x,cur.a)||Math.abs(x-cur.a)<=ulp*3.001;
      }else if(cur.fix){
        ok=Math.abs(x-cur.a)<=Math.max(Math.abs(cur.a)*0.001,0.501*Math.pow(10,-cur.dc));
      }else{
        /* akzeptiert: 4 signifikante Stellen oder genauer; Abweichung bis 3 Einheiten der 4. Stelle
           (gerundete Zwischenergebnisse, anderer Rechenweg) */
        ok=Math.abs(x-cur.a)<=Math.max(ulp*3.001,Math.abs(cur.a)*1e-9);
        if(!ok&&Math.abs(x-cur.a)<=Math.abs(cur.a)*0.01){
          hint=nd<4?'Der Wert liegt nah dran, ist aber zu stark gerundet. Gib mindestens 4 signifikante Stellen an.'
                   :'Knapp daneben. Prüfe die Rechnung – vielleicht ist ein Wert falsch abgeschrieben oder ein Zwischenergebnis sehr grob gerundet.';
        }
      }
      if(ok){
        state='solved';st.R[st.lvl]++;save();renderProg();cnt();
        solution(`<strong>Richtig${hints?` (mit ${hints} Tipp${hints>1?'s':''})`:''}.</strong> Vergleiche mit deinem Rechenweg im Heft:`,'ok');
      }else{
        let msg=hint||'Prüfe deinen Rechenweg Schritt für Schritt.';
        const r=x/cur.a;
        if(!hint&&cur.diag)msg=cur.diag(x)||msg;
        if(!hint&&!cur.sig&&!(cur.diag&&cur.diag(x))){
          for(const f of [10,100,1000,3600,60,24,1e4,1e5,1e6,1e7,1e8,1e9]){
            if(Math.abs(r/f-1)<0.02||Math.abs(r*f-1)<0.02){
              msg=`Dein Ergebnis ist um den Faktor ${K.nf(f)} verschoben. Prüfe die Einheiten und die Umrechnungszahl`+(f>=1000&&[1000,1e4,1e5,1e6,1e7,1e8,1e9].includes(f)?' – oder hast du in der Taschenrechner-Anzeige die Zehnerpotenz (×10⁻³, E−3) übersehen?':'.');break}
          }
          if(Math.abs(r-1)<0.05&&Math.abs(r-1)>0.01)msg='Knapp daneben. Prüfe die Rechnung – und runde erst ganz am Ende.';
        }
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
  function renderProg(){
    if(!pHost)return;
    $('.prog',pHost).innerHTML=['B','S','V'].map(L=>{
      const tp=Math.min(st.T[L],need.T),rp=Math.min(st.R[L],need.R),ok=tp>=need.T&&rp>=need.R;
      return `<div class="prow" data-l="${L}"><div class="lvlc"><span class="lvl ${L}">${LV[L]}</span></div>
        <div class="meter">Trainer ${tp}/${need.T}<div class="trk"><div class="fill" style="width:${tp/need.T*100}%"></div></div></div>
        <div class="meter">Rechnen ${rp}/${need.R}<div class="trk"><div class="fill" style="width:${rp/need.R*100}%"></div></div></div>
        <div class="done ${ok?'yes':''}">${K.status(st,L)}</div></div>`}).join('');
  }
  if(pHost){
    pHost.innerHTML=`<div class="prog"></div>
      <p class="small">Gespeichert nur in diesem Browser. Alle Module auf einen Blick: <a href="fortschritt.html">Mein Fortschritt</a>. Geschaffte Stufen hakst du in deinem Lerntagebuch ab.</p>
      <div class="confirm p-reset"></div>`;
    const resetUI=()=>{
      const box=$('.p-reset',pHost);
      box.innerHTML='<button class="btn ghost">Lernstand dieses Moduls zurücksetzen</button>';
      box.firstChild.onclick=()=>{
        box.innerHTML='<span>Wirklich alles auf null setzen?</span><button class="btn">Ja, zurücksetzen</button><button class="btn ghost">Abbrechen</button>';
        const bs=box.querySelectorAll('button');
        bs[0].onclick=()=>{st.T={B:0,S:0,V:0};st.R={B:0,S:0,V:0};st.D={B:{},S:{},V:{}};save();renderProg();setLvl(st.lvl);resetUI()};
        bs[1].onclick=resetUI;
      };
    };
    resetUI();renderProg();
  }
  setLvl(st.lvl);
};

K.copyBtn=(btn,el)=>{
  btn.onclick=()=>{
    const txt=el.textContent;
    const ok=()=>{btn.textContent='Kopiert';setTimeout(()=>btn.textContent='Kopieren',1500)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)};
    try{navigator.clipboard.writeText(txt).then(ok,sel)}catch(e){sel()}
  };
};

/* ---------- Startseite: Status-Chips auf den Modulkarten ---------- */
const MARK={offen:'',angefangen:'',geschafft:' ✓'};
K.overview=function(){
  K.MODS.forEach(m=>{
    const host=document.querySelector(`[data-mod="${m.id}"] .st`);if(!host)return;
    if(m.rw){const n=(K.load('rw').solved||[]).length;
      host.insertAdjacentHTML('beforeend',`<span class="pill ${n>=K.RW_NEED?'ok':n?'half':''}">Detektiv ${Math.min(n,K.RW_NEED)}/${K.RW_NEED}</span>`);return}
    const st=K.load(m.id);
    ['B','S','V'].forEach(L=>{const s=K.status(st,L);
      host.insertAdjacentHTML('beforeend',`<span class="pill ${s==='geschafft'?'ok':s==='angefangen'?'half':''}" title="${LV[L]}: ${s}">${LV[L]}${MARK[s]}</span>`)});
  });
};

/* ---------- Seite „Mein Fortschritt“ ---------- */
K.progressPage=function(host){
  const esc=t=>t.replace(/&/g,'&amp;');
  const chip=(s,d)=>`<span class="stat ${s}">${s}</span>${d&&(d.b||d.g)?`<span class="dates">${d.b?'begonnen '+K.dDE(d.b):''}${d.g?'<br>geschafft '+K.dDE(d.g):''}</span>`:''}`;
  let pfl=0,pflN=0,lv={B:0,S:0,V:0};
  const rows=K.MODS.map(m=>{
    if(m.rw){const n=(K.load('rw').solved||[]).length,s=n>=K.RW_NEED?'geschafft':n?'angefangen':'offen';
      pflN++;if(s==='geschafft')pfl++;
      return `<tr><th scope="row"><a href="${m.href}">${m.nr} · ${esc(m.t)}</a>${m.p?' <span class="pill pflicht">Pflicht</span>':''}</th>
        <td colspan="3" class="pcell">${chip(s)}<span class="dates">Rechenweg-Detektiv ${Math.min(n,K.RW_NEED)}/${K.RW_NEED}</span></td></tr>`}
    const st=Object.assign({T:{},R:{},D:{}},K.load(m.id));
    if(m.p){pflN++;if(K.status(st,'S')==='geschafft'||K.status(st,'V')==='geschafft')pfl++}
    return `<tr><th scope="row"><a href="${m.href}">${m.nr} · ${esc(m.t)}</a>${m.p?' <span class="pill pflicht">Pflicht</span>':''}</th>`+
      ['B','S','V'].map(L=>{const s=K.status(st,L);if(s==='geschafft')lv[L]++;
        const meta=s==='angefangen'?`<span class="meta">Trainer ${Math.min(st.T[L]||0,K.NEED.T)}/${K.NEED.T}<br>Rechnen ${Math.min(st.R[L]||0,K.NEED.R)}/${K.NEED.R}</span>`:'';
        return `<td class="pcell">${chip(s,(st.D||{})[L])}${meta}</td>`}).join('')+'</tr>';
  }).join('');
  host.innerHTML=`<div class="kpis">
      <div class="kpi"><span class="kv">${pfl}<small> / ${pflN}</small></span><span class="kl">Pflichtkern-Module geschafft<br>(Rechenweg + Standard oder Vertiefung)</span></div>
      <div class="kpi"><span class="kv">${lv.B+lv.S+lv.V}</span><span class="kl">Niveaustufen geschafft<br>Basis ${lv.B} · Standard ${lv.S} · Vertiefung ${lv.V}</span></div>
    </div>
    <div class="tscroll"><table class="ptable">
      <thead><tr><th>Modul</th><th>Basis</th><th>Standard</th><th>Vertiefung</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
};
})();
