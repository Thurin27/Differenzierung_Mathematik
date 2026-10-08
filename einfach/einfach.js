/* Mathe einfach – Helfer für die einfache Version (braucht ../assets/kurs.js)
   Fortschritt zählt in dieselben Module wie der normale Kurs, Stufe Basis.
   Schritt 0 (Rechenweg) speichert unter 'rwe'. */
(function(){
const K=window.K;
const E=K.E={};
/* Aufgabentext: kurze Situation, Liste „Das weißt du“, Frage, optional Satzanfang für den Antwortsatz */
E.tx=(sit,geg,frage,start)=>`<p>${sit}</p><p class="small muted">Das weißt du:</p><ul class="gw">${geg.map(([a,b])=>`<li>${a}: <b>${b}</b></li>`).join('')}</ul><p><b>Frage:</b> ${frage}</p>`+(start?`<p class="satz">Antwortsatz im Heft: <b>${start}</b></p>`:'');
/* Trainer-Frage (immer Basis) */
E.T=(n,prompt,ok,w,h,ask)=>({L:'B',n,prompt,ask:ask||'Was ist richtig?',ok,w,h});
/* Modul starten: feste Stufe Basis, einfache Rückmeldungen */
E.run=cfg=>K.module(Object.assign({lock:'B',simple:true,root:'../',standLink:'index.html'},cfg));
/* Startseite: Status je Schritt */
E.overview=()=>{
  document.querySelectorAll('[data-step]').forEach(a=>{
    const id=a.dataset.step,st=K.load(id),s=K.status(st,'B'),host=a.querySelector('.st');if(!host)return;
    const t=Math.min((st.T||{}).B||0,K.NEED.T),r=Math.min((st.R||{}).B||0,K.NEED.R);
    host.innerHTML=s==='geschafft'?'<span class="pill ok">geschafft ✓</span>'
      :s==='angefangen'?`<span class="pill half" title="Trainer ${t} von ${K.NEED.T}, Rechnen ${r} von ${K.NEED.R}">angefangen</span>`
      :'<span class="pill">offen</span>';
  });
};
})();
