  // ---------------------- Aptitude Engine ----------------------
  const Aptitude = (() => {
    const bank = {
      number_systems: [
        { q: 'Find the LCM of 12 and 18.', opts: ['24','36','48','54'], ans: 1 },
        { q: 'What is 2^5?', opts: ['16','32','64','48'], ans: 1 },
        { q: 'Which is divisible by 9?', opts: ['1235','2347','198','2001'], ans: 2 }
      ],
      arithmetic: [
        { q: 'Evaluate 8 + 6 × 2 using BODMAS.', opts: ['28','20','16','12'], ans: 1 },
        { q: 'Which is greater: 3/4 or 7/10?', opts: ['3/4','7/10','Equal','Cannot determine'], ans: 0 }
      ],
      percentages: [
        { q: 'Increase 200 by 15%.', opts: ['215','220','230','245'], ans: 2 },
        { q: 'A product costs 500 and is sold at 10% loss. SP?', opts: ['450','475','500','510'], ans: 1 }
      ],
      interest: [
        { q: 'SI on 1000 at 10% for 2 years is', opts: ['100','150','200','250'], ans: 2 },
        { q: 'CI on 1000 at 10% for 2 years (annual) ≈', opts: ['200','210','220','190'], ans: 1 }
      ],
      ratio: [
        { q: 'Divide 300 in ratio 2:3.', opts: ['100,200','120,180','150,150','140,160'], ans: 1 }
      ],
      time_work: [
        { q: 'A does a work in 10 days, B in 15. Together?', opts: ['6','7','8','9'], ans: 1 },
        { q: 'Pipes A(6h) and B(8h) fill tank. Together?', opts: ['3.43h','3.5h','3.75h','4h'], ans: 2 }
      ],
      time_distance: [
        { q: 'Speed if 120 km in 2 hours?', opts: ['40','50','60','80'], ans: 2 },
        { q: 'Average speed of 60km @30km/h and 60km @60km/h', opts: ['40','45','50','55'], ans: 1 }
      ],
      mensuration: [
        { q: 'Area of circle radius 7', opts: ['154','44','77','49'], ans: 0 },
        { q: 'Volume of cube side 3', opts: ['9','18','27','36'], ans: 2 }
      ],
      di: [
        { q: 'If a bar shows sales up 20% from 100 → 120, percent increase is', opts: ['10%','15%','20%','25%'], ans: 2 }
      ],
      algebra: [
        { q: 'Roots of x^2 - 5x + 6 = 0 are', opts: ['(2,3)','(1,6)','(3,3)','(2,2)'], ans: 0 }
      ],
      simplification: [
        { q: '√144 + 3^3 =', opts: ['12+27=39','14+9=23','10+27=37','12+9=21'], ans: 0 }
      ],
      probability: [
        { q: 'Probability of heads in fair coin', opts: ['1/4','1/3','1/2','1'], ans: 2 }
      ],
      misc: [
        { q: 'log10(100) =', opts: ['1','2','3','10'], ans: 1 }
      ],
      current: [
        { q: 'Which is a G20 member?', opts: ['Nepal','Singapore','Argentina','Norway'], ans: 2 },
        { q: 'UN headquarters is in', opts: ['Geneva','New York','Vienna','Paris'], ans: 1 }
      ]
    };

  // Try initial render once the page and Chart.js are ready
  setTimeout(()=>{ try { if (window.renderAptCharts) window.renderAptCharts(); } catch(_){} }, 400);

  // Defensive: ensure no overlay blocks clicks in Games area
  try{
    if (!document.getElementById('aptClickSafe')){
      const st=document.createElement('style');
      st.id='aptClickSafe';
      st.textContent = `#games, #games * { pointer-events:auto !important; }`;
      document.head.appendChild(st);
    }
  }catch(_){}

  // Global fallback delegation for Aptitude controls (non-capture, no preventDefault)
  (function attachGlobalDelegation(){
    let lock=false;
    document.addEventListener('click', (ev)=>{
      const target = ev.target.closest('#aptStart, #aptNext, #aptSubmit');
      if (!target) return;
      if (lock) return;
      lock=true;
      try{
        if (target.id==='aptStart') { if (Aptitude && typeof Aptitude.begin==='function') Aptitude.begin(); }
        else if (target.id==='aptNext') { if (Aptitude && typeof Aptitude.next==='function') Aptitude.next(); }
        else if (target.id==='aptSubmit') { if (Aptitude && typeof Aptitude.submit==='function') Aptitude.submit(); }
      } catch(err){ console.error('Apt delegation error', err); }
      finally{ setTimeout(()=>lock=false, 200); }
    }, false);
  })();

    // Random utilities
    const ri = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    const rf = (a,b,dp=0)=>Number((Math.random()*(b-a)+a).toFixed(dp));
    const choice = arr => arr[Math.floor(Math.random()*arr.length)];

    // Procedural generators per topic (produce many unique MCQs)
    const gen = {
      number_systems: (n=60)=>{
        const out=[]; for(let i=0;i<n;i++){ const a=ri(2,40), b=ri(2,40); const g=(x,y)=>y?g(y,x%y):x; const l=a*b/g(a,b); const q=`Find the LCM of ${a} and ${b}.`; const opts=[l, l+ri(2,12), Math.max(2,l-ri(2,12)), l+ri(13,25)].map(x=>String(x)); const ans=0; out.push({q,opts,ans}); }
        for(let i=0;i<n;i++){ const p=ri(2,6), e=ri(2,5); const val=Math.pow(p,e); const q=`What is ${p}^${e}?`; const opts=[val, val+p, val-p, val*2].map(String); out.push({q,opts,ans:0}); }
        return out;
      },
      arithmetic: (n=40)=>{
        const out=[]; for(let i=0;i<n;i++){ const a=ri(5,20), b=ri(2,9), c=ri(1,9); const val=a+b*c; const q=`Evaluate ${a} + ${b} × ${c} (BODMAS).`; const opts=[val,val+ri(1,3),val-ri(1,3),a*(b+c)].map(String); out.push({q,opts,ans:0}); } return out;
      },
      percentages: (n=60)=>{
        const out=[]; for(let i=0;i<n;i++){ const base=ri(100,900); const p=choice([5,10,12,15,20,25,30]); const inc=Math.round(base*(1+p/100)); const q=`Increase ${base} by ${p}%.`; const opts=[inc, base, inc+ri(5,20), inc-ri(5,20)].map(String); out.push({q,opts,ans:0}); }
        for(let i=0;i<n;i++){ const cp=ri(200,1200); const loss=choice([5,10,12,15,20]); const sp=Math.round(cp*(1-loss/100)); const q=`A product costs ${cp} and is sold at ${loss}% loss. Find SP.`; const opts=[sp, sp+ri(5,30), sp-ri(5,30), cp].map(String); out.push({q,opts,ans:0}); } return out; },
      interest: (n=40)=>{
        const out=[]; for(let i=0;i<n;i++){ const P=ri(500,5000), R=choice([5,6,8,10,12]), T=ri(1,5); const si=Math.round(P*R*T/100); const q=`Simple Interest on ${P} at ${R}% for ${T} years = ?`; const opts=[si, si+ri(10,50), Math.max(0,si-ri(10,50)), si+ri(60,120)].map(String); out.push({q,opts,ans:0}); }
        for(let i=0;i<n;i++){ const P=ri(500,5000), R=choice([5,8,10,12]), T=ri(1,4); const ci=Math.round(P*Math.pow(1+R/100,T)-P); const q=`Compound Interest on ${P} at ${R}% for ${T} years (annual) ≈ ?`; const opts=[ci, ci+ri(10,80), Math.max(0,ci-ri(10,80)), ci+ri(90,160)].map(String); out.push({q,opts,ans:0}); } return out; },
      ratio: (n=40)=>{ const out=[]; for(let i=0;i<n;i++){ const A=ri(100,900), r1=ri(1,5), r2=ri(1,5); const total=r1+r2; const x=A*r1/total, y=A*r2/total; const q=`Divide ${A} in the ratio ${r1}:${r2}.`; const opts=[`${Math.round(x)}, ${Math.round(y)}`, `${Math.round(x+10)}, ${Math.round(y-10)}`, `${Math.round(x-10)}, ${Math.round(y+10)}`, `${Math.round(A/2)}, ${Math.round(A/2)}`]; out.push({q,opts,ans:0}); } return out; },
      time_work: (n=60)=>{ const out=[]; for(let i=0;i<n;i++){ const a=ri(6,18), b=ri(8,24); const together=Number((1/(1/a+1/b)).toFixed(2)); const q=`A does a work in ${a} days, B in ${b} days. Together they take (days)?`; const opts=[together, +(together+rf(0.2,1,2)).toFixed(2), +(Math.max(1,together-rf(0.2,1,2))).toFixed(2), +(together+rf(1,2,2)).toFixed(2)].map(String); out.push({q,opts,ans:0}); } return out; },
      time_distance: (n=60)=>{ const out=[]; for(let i=0;i<n;i++){ const d=ri(60,360), t=ri(1,6); const s=Math.round(d/t); const q=`Speed if ${d} km in ${t} hours (km/h)?`; const opts=[s,s+ri(5,20),Math.max(5,s-ri(5,20)),s+ri(21,40)].map(String); out.push({q,opts,ans:0}); } return out; },
      mensuration: (n=40)=>{ const out=[]; for(let i=0;i<n;i++){ const r=ri(3,15); const area=Math.round(3.14*r*r); const q=`Area of a circle of radius ${r} (π≈3.14)`; const opts=[area, area+ri(5,20), Math.max(1,area-ri(5,20)), r*r*2].map(String); out.push({q,opts,ans:0}); } return out; },
      algebra: (n=40)=>{ const out=[]; for(let i=0;i<n;i++){ const x=ri(2,9), y=ri(1,9); const a1=ri(1,5), b1=ri(1,5), c1=a1*x+b1*y; const a2=ri(1,5), b2=ri(1,5), c2=a2*x+b2*y; const q=`Solve: ${a1}x+${b1}y=${c1}, ${a2}x+${b2}y=${c2}. Find x.`; const opts=[x, x+ri(1,3), Math.max(0,x-ri(1,3)), x+ri(4,6)].map(String); out.push({q,opts,ans:0}); } return out; },
      simplification: (n=40)=>{ const out=[]; for(let i=0;i<n;i++){ const a=ri(4,15), b=ri(2,5); const v=Math.round(Math.sqrt(a*a*b*b)); const q=`√(${a*a*b*b}) = ?`; const opts=[v, v+ri(1,4), Math.max(1,v-ri(1,4)), v+ri(5,9)].map(String); out.push({q,opts,ans:0}); } return out; },
      probability: (n=40)=>{ const out=[]; for(let i=0;i<n;i++){ const nCoins=choice([1,2,3]); const heads=1; const p = nCoins===1? '1/2' : nCoins===2? '1/2' : '3/8'; const q=`Probability of exactly one head when tossing ${nCoins} fair coin(s)`; const opts=[p,'1/3','1/4','2/3']; out.push({q,opts,ans:0}); } return out; },
      di: (n=40)=>{ const out=[]; for(let i=0;i<n;i++){ const base=ri(100,500), inc=choice([10,15,20,25]); const val=base*(1+inc/100); const q=`A value rises from ${base} to ${Math.round(val)}. Percentage increase = ?`; const opts=[`${inc}%`, `${inc-5}%`, `${inc+5}%`, `${inc+10}%`]; out.push({q,opts,ans:0}); } return out; },
      misc: (n=30)=>{ const out=[]; for(let i=0;i<n;i++){ const a=ri(2,9), b=ri(2,9), v=a*b; const q=`How many factors does ${v} have?`; const count=(n)=>{let c=0; for(let k=1;k*k<=n;k++){ if(n%k===0) c+=(k*k===n?1:2);} return c;}; const fc=count(v); const opts=[fc, fc+1, Math.max(1,fc-1), fc+2].map(String); out.push({q,opts,ans:0}); } return out; },
      current: (n=40)=>{ const out=[]; const qa=[
        ['Currency of Japan', ['Won','Yen','Ringgit','Dollar'],1],
        ['Largest ocean', ['Indian','Arctic','Pacific','Atlantic'],2],
        ['Headquarters of UN', ['Geneva','New York','Vienna','Paris'],1]
      ]; for(let i=0;i<n;i++){ const [q,opts,ans]=choice(qa); out.push({q,opts:[...opts],ans}); } return out; }
    };

    // Merge external questions into bank and persist
    function merge(data){
      try {
        if (!data) return 0;
        let added = 0;
        const addItems = (topic, items) => {
          if (!Array.isArray(items)) return;
          bank[topic] = bank[topic] || [];
          items.forEach(it => {
            if (it && typeof it.q === 'string' && Array.isArray(it.opts) && typeof it.ans === 'number') {
              bank[topic].push({ q: it.q, opts: it.opts.slice(0,4), ans: it.ans|0 });
              added++;
            }
          });
        };

        if (Array.isArray(data)) {
          data.forEach(entry => {
            if (entry && entry.topic && Array.isArray(entry.items)) addItems(entry.topic, entry.items);
          });
        } else if (data.topic && Array.isArray(data.items)) {
          addItems(data.topic, data.items);
        } else if (typeof data === 'object') {
          Object.keys(data).forEach(k => addItems(k, data[k]));
        }

        // persist
        localStorage.setItem('minddesk_apt_bank_extra', JSON.stringify(bank));
        return added;
      } catch(_) { return 0; }
    }

    // Load persisted bank extension
    try {
      const saved = JSON.parse(localStorage.getItem('minddesk_apt_bank_extra')||'null');
      if (saved) merge(saved);
    } catch(_){ }

    // Also try to load a local packaged bank from /data/aptitude_bank.json (if present)
    (async () => {
      try {
        const res = await fetch('data/aptitude_bank.json', { cache: 'no-store' });
        if (res && res.ok) {
          const data = await res.json();
          merge(data);
        }
      } catch(_){ /* ignore if file not present */ }
    })();

    let order = [], idx = 0, selection = -1, timerId = 0, secs = 0, topic = 'number_systems';
    let sessionCorrect = 0, sessionTotal = 0;
    const elQ = () => document.getElementById('aptQuestion');
    const elO = () => document.getElementById('aptOptions');
    const elT = () => document.getElementById('aptTimer');
    const elP = () => document.getElementById('aptProgress');
    const elF = () => document.getElementById('aptFeedback');
    const elB = () => document.getElementById('aptBoard');

    function tick(){ secs++; const m=String(Math.floor(secs/60)).padStart(2,'0'); const s=String(secs%60).padStart(2,'0'); elT().textContent = `⏱ ${m}:${s}`; }
    function startTimer(){ stopTimer(); secs=0; tick(); timerId = setInterval(tick,1000); }
    function stopTimer(){ if (timerId) { clearInterval(timerId); timerId=0; } }

    function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;}

    function begin(){
      // Auto-seed: if topic has < 50 items, generate and merge
      if (!bank[topic] || bank[topic].length < 50) {
        if (gen[topic]) {
          const created = gen[topic](60);
          bank[topic] = (bank[topic]||[]).concat(created);
        }
      }
      const pool = bank[topic] ? [...bank[topic]] : [];
      if (!pool.length){ elF().textContent='No questions in this topic yet.'; return; }
      // allow dynamic question count (set by About quick-practice or defaults)
      const qcount = Number(localStorage.getItem('minddesk_apt_qcount')) || 20;
      order = shuffle(pool).slice(0, Math.max(5, Math.min(60, qcount)));
      idx = 0; selection = -1;
      sessionCorrect = 0; sessionTotal = 0; updateBoard();
      document.getElementById('aptNext').disabled = true;
      document.getElementById('aptSubmit').disabled = true;
      elF().textContent='';
      render();
      startTimer();
    }

    const GC = () => (window.GameCore || { score: 0, riskMode: false, addScore: ()=>{} });
    function updateBoard(){
      const b = elB(); if (b) b.textContent = `Score: ${GC().score} • Correct: ${sessionCorrect}/${sessionTotal}`;
    }

    function render(){
      const cur = order[idx];
      if (!cur){ finish(); return; }
      elQ().textContent = cur.q;
      elP().textContent = `Q ${idx+1}/${order.length}`;
      elO().innerHTML = '';
      cur.opts.forEach((t,i)=>{
        const b=document.createElement('button');
        b.className='secondary';
        b.type='button';
        b.textContent = `${String.fromCharCode(65+i)}. ${t}`;
        b.dataset.idx = String(i);
        elO().appendChild(b);
      });
      // ensure options are enabled for a fresh question
      document.querySelectorAll('#aptOptions button').forEach(btn=>btn.disabled=false);
    }

    function saveStats(topic, ok){
      try{
        const key='minddesk_apt_stats';
        const data=JSON.parse(localStorage.getItem(key)||'{}');
        const t=data[topic]||{correct:0,total:0};
        t.total+=1; if(ok) t.correct+=1; data[topic]=t;
        localStorage.setItem(key, JSON.stringify(data));
      }catch(_){}
    }

    function submit(){
      const cur = order[idx];
      if (selection===-1) return;
      const ok = selection===cur.ans;
      GC().addScore(ok? 10 : -5);
      try { window.VoiceEngine && window.VoiceEngine.speak && window.VoiceEngine.speak(ok? 'Correct' : 'Wrong', ok? 'happy':'warning'); } catch(_){ }
      elF().textContent = ok? `✅ Correct (+${GC().riskMode?20:10})` : '❌ Wrong (−5)';
      document.getElementById('aptNext').disabled = false;
      document.getElementById('aptSubmit').disabled = true;
      // update session stats
      sessionTotal += 1; if (ok) sessionCorrect += 1; updateBoard();
      // lock options until Next
      document.querySelectorAll('#aptOptions button').forEach(btn=>btn.disabled=true);
      saveStats(topic, ok);
      try { if (window.renderAptCharts) window.renderAptCharts(); } catch(_) {}
    }

    function next(){ idx++; selection=-1; elF().textContent=''; document.getElementById('aptNext').disabled = true; render(); }
    function finish(){ stopTimer(); showSummary(); }

    async function loadFromUrl(url){
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP '+res.status);
        const data = await res.json();
        const n = merge(data);
        showToast(n ? `Loaded ${n} questions` : 'No questions added');
      } catch(e) {
        showToast('Load failed: '+(e.message||e));
      }
    }

    function loadFromPaste(){
      const txt = prompt('Paste questions JSON here');
      if (!txt) return;
      try {
        const data = JSON.parse(txt);
        const n = merge(data);
        showToast(n ? `Added ${n} questions` : 'No questions added');
      } catch(e) { showToast('Invalid JSON'); }
    }

    function loadSamplePack(){
      const sample = [
        { topic:'percentages', items:[
          { q:'Find 35% of 240', opts:['72','84','96','64'], ans:1 },
          { q:'Price increased from 800 to 920. % increase?', opts:['10%','12%','15%','18%'], ans:0 },
          { q:'What percent is 45 of 180?', opts:['15%','20%','25%','30%'], ans:3 }
        ]},
        { topic:'time_work', items:[
          { q:'A completes work in 12 days, B in 18. Together?', opts:['6d','7.2d','7.5d','8d'], ans:1 },
          { q:'A is 50% as efficient as B. B takes 10 days. A alone?', opts:['15','18','20','25'], ans:2 }
        ]},
        { topic:'ratio', items:[
          { q:'Ratios 2:3 and 4:9 combined (A:B:C)?', opts:['8:12:27','6:9:14','2:3:4','4:6:9'], ans:0 },
          { q:'Milk:water is 3:1. Add water to make 3:2. Water added in 20L?', opts:['3.33L','5L','6.67L','10L'], ans:2 }
        ]},
        { topic:'algebra', items:[
          { q:'If x+1/x=5, find x^2+1/x^2', opts:['25','23','21','27'], ans:2 },
          { q:'Solve: 2x+3=11', opts:['3','4','5','6'], ans:1 }
        ]},
        { topic:'current', items:[
          { q:'Currency of Japan', opts:['Won','Yen','Ringgit','Dollar'], ans:1 },
          { q:'Largest ocean', opts:['Indian','Arctic','Pacific','Atlantic'], ans:2 }
        ]}
      ];
      const n = merge(sample);
      showToast(`Sample added: ${n} questions`);
    }

    function wire(){
      const startBtn=document.getElementById('aptStart');
      const nextBtn=document.getElementById('aptNext');
      const submitBtn=document.getElementById('aptSubmit');
      const topicSel=document.getElementById('aptTopic');
      const loadBtn=document.getElementById('aptLoadUrl');
      const pasteBtn=document.getElementById('aptPaste');
      const sampleBtn=document.getElementById('aptSample');
      const urlInput=document.getElementById('aptUrl');
      if (!startBtn||!nextBtn||!submitBtn||!topicSel) return;
      topicSel.addEventListener('change',()=>{ topic=topicSel.value; });
      // Anti-flicker style injection
      try{
        if (!document.getElementById('aptAntiFlicker')){
          const st=document.createElement('style');
          st.id='aptAntiFlicker';
          st.textContent = `
            #games, #games * { animation: none !important; transition: none !important; }
            #games .card:hover { transform: none !important; box-shadow: none !important; }
            #games .card::after { opacity: 0 !important; }
            #games button { backface-visibility: hidden; transform: translateZ(0); }
            #games .primary-btn, #games .secondary { transition: none !important; }
            #games button:hover { transform: none !important; }
            #aptControls button { position: relative; z-index: 3; pointer-events: auto !important; }
            /* Stable, accessible answer options */
            #aptOptions { display: grid; gap: 10px; }
            #aptOptions button { 
              position: relative; z-index: 2; pointer-events: auto !important;
              width: 100%; text-align: left; padding: 12px 14px; border-radius: 10px;
              border: 1px solid var(--border); background: var(--surface); box-shadow: none !important;
            }
            #aptOptions button.primary-btn { border-color: var(--accent); }
          `;
          document.head.appendChild(st);
        }
      }catch(_){}

      const safeOnClick = (el, handler) => {
        if (!el) return;
        let locked=false;
        el.addEventListener('click', (e)=>{
          if (locked) return;
          locked=true;
          try { handler(e); } finally { setTimeout(()=>locked=false, 250); }
        });
      };

      // Ensure topic has a value
      if (topicSel && !topicSel.value) topicSel.value = 'number_systems';

      safeOnClick(startBtn, begin);
      safeOnClick(nextBtn, next);
      safeOnClick(submitBtn, submit);
      // Hard fallback: assign direct onclick to avoid any third-party interference
      if (startBtn && !startBtn.__onclickBound){ startBtn.__onclickBound=true; startBtn.onclick = (e)=>{ try{ e.preventDefault(); begin(); }catch(_){} }; }
      if (loadBtn) safeOnClick(loadBtn, ()=>{ const u=urlInput.value.trim(); if(u) loadFromUrl(u); });
      if (pasteBtn) safeOnClick(pasteBtn, loadFromPaste);
      if (sampleBtn) safeOnClick(sampleBtn, loadSamplePack);

      // Periodic rebind in case DOM was re-rendered
      setInterval(()=>{
        const s=document.getElementById('aptStart');
        const n=document.getElementById('aptNext');
        const u=document.getElementById('aptSubmit');
        if (s && !s.__wired){ s.__wired=true; safeOnClick(s, begin); }
        if (n && !n.__wired){ n.__wired=true; safeOnClick(n, next); }
        if (u && !u.__wired){ u.__wired=true; safeOnClick(u, submit); }
      }, 1000);

      // Event delegation for option buttons to ensure clicks always register
      let optBusy=false;
      const optHandler = (e)=>{
        if (optBusy) return;
        const btn = e.target.closest('button');
        if (!btn) return;
        const idx = Array.from(document.querySelectorAll('#aptOptions button')).indexOf(btn);
        if (idx>=0){
          optBusy=true;
          selection = idx;
          document.querySelectorAll('#aptOptions button').forEach(x=>x.classList.remove('primary-btn'));
          btn.classList.add('primary-btn');
          document.getElementById('aptSubmit').disabled=false;
          setTimeout(()=>{ optBusy=false; }, 150);
        }
      };
      const optsEl = document.getElementById('aptOptions');
      optsEl.addEventListener('click', optHandler);

      // Keyboard shortcuts: 1-4 to select options, Enter to submit
      document.addEventListener('keydown', (ev)=>{
        if (ev.repeat) return; // prevent key repeat flicker
        if (!document.body.contains(document.getElementById('aptQ'))) return;
        if (['1','2','3','4'].includes(ev.key)){
          const k = Number(ev.key)-1;
          const btn = document.querySelectorAll('#aptOptions button')[k];
          if (btn){ btn.click(); ev.preventDefault(); }
        } else if (ev.key === 'Enter'){
          if (!document.getElementById('aptSubmit').disabled){ submit(); ev.preventDefault(); }
        }
      });
    }

    return { wire, begin, next, submit };
  })();

  Aptitude.wire();
  // Global fallbacks for inline onclick
  window.__aptStart = () => { try { if (Aptitude && typeof Aptitude.begin==='function') Aptitude.begin(); } catch(e){ console.warn('Start failed', e); } };
  window.__aptSubmit = () => { try { if (Aptitude && typeof Aptitude.submit==='function') Aptitude.submit(); } catch(e){ console.warn('Submit failed', e); } };
  window.__aptNext = () => { try { if (Aptitude && typeof Aptitude.next==='function') Aptitude.next(); } catch(e){ console.warn('Next failed', e); } };

  // Helper to start practice programmatically: topic + difficulty ('easy'|'medium'|'hard')
  window.startAptPractice = (topic, level) => {
    try {
      const map = { easy: 10, medium: 20, hard: 30 };
      const qcount = map[level] || 20;
      localStorage.setItem('minddesk_apt_qcount', String(qcount));
      const sel = document.getElementById('aptTopic');
      if (sel) sel.value = topic || sel.value || 'number_systems';
      // ensure the Games section is visible
      document.querySelector('[data-target="games"]')?.click();
      setTimeout(()=>{ try { window.__aptStart && window.__aptStart(); } catch(_){} }, 180);
    } catch(e){ console.warn('startAptPractice failed', e); }
  };

  // Optional charts on Dashboard for Aptitude stats
  window.renderAptCharts = function(){
    try {
      const pie = document.getElementById('aptPie');
      const radar = document.getElementById('aptRadar');
      if (!pie && !radar) return;
      const stats = JSON.parse(localStorage.getItem('minddesk_apt_stats')||'{}');
      const topics = Object.keys(stats);
      const correct = topics.map(t=>stats[t].correct||0);
      const total = topics.map(t=>stats[t].total||0);
      const incorrect = total.map((v,i)=>Math.max(0,v-correct[i]));
      if (pie){
        const ctx = pie.getContext('2d');
        if (pie._chart) pie._chart.destroy();
        pie._chart = new Chart(ctx, {
          type: 'doughnut',
          data: { labels: ['Correct','Incorrect'], datasets: [{ data: [correct.reduce((a,b)=>a+b,0), incorrect.reduce((a,b)=>a+b,0)], backgroundColor: ['#22c55e','#ef4444'] }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
        });
        // small accessible center label
        try{
          const total = correct.reduce((a,b)=>a+b,0) + incorrect.reduce((a,b)=>a+b,0);
          const correctSum = correct.reduce((a,b)=>a+b,0);
          const pct = total ? Math.round(correctSum/total*100) : 0;
          // place a small overlay text near the canvas
          const wrap = pie.parentElement;
          if (wrap && !wrap.querySelector('.apt-center')){
            const c = document.createElement('div');
            c.className='apt-center';
            c.style.position='absolute';
            c.style.left='12px';
            c.style.top='12px';
            c.style.pointerEvents='none';
            c.style.fontSize='14px';
            c.style.fontWeight='700';
            c.style.color='var(--text)';
            c.textContent = `${pct}% correct`;
            wrap.style.position='relative';
            wrap.appendChild(c);
          }
        }catch(_){ }
      }
      if (radar){
        const ctx = radar.getContext('2d');
        if (radar._chart) radar._chart.destroy();
        const acc = topics.map((t,i)=> total[i] ? Math.round(correct[i]/total[i]*100) : 0);
        radar._chart = new Chart(ctx, {
          type: 'radar',
          data: { labels: topics, datasets: [{ label: 'Accuracy %', data: acc, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' }] },
          options: { responsive: true, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
        });
      }
      try { if (window.renderApt3D) window.renderApt3D(); } catch(_){}
    } catch(_){}
  };
/* ============================================================
   MindDesk – Unified Games Engine with AI Voice Narration
   Author: Nhowmitha Suresh
   Features:
   - All games working
   - Rewards & penalties
   - Timers
   - Adaptive difficulty
   - AI-generated voices with emotion simulation
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "dashboard") return;

  console.log("🎮 MindDesk Aptitude Engine Loaded");

  // Rebuild #games section into an Aptitude Quiz (replacing old mini-games UI)
  try {
    const gamesSection = document.getElementById('games');
    if (gamesSection) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h2 style="margin:0 0 6px 0">Aptitude & Current Affairs</h2>
        <p class="subtitle">Practice quantitative aptitude with scoring, streaks, and a timer. Toggle Risk x2 for higher stakes.</p>
        <div id="aptControls" style="display:flex;gap:8px;align-items:center;margin:8px 0 10px 0">
          <select id="aptTopic" style="padding:6px;border:1px solid var(--border);border-radius:6px">
            <option value="number_systems">Number Systems</option>
            <option value="arithmetic">Arithmetic Fundamentals</option>
            <option value="percentages">Percentages & Profit–Loss</option>
            <option value="interest">Simple & Compound Interest</option>
            <option value="ratio">Ratio & Proportion</option>
            <option value="time_work">Time, Work & Wages</option>
            <option value="time_distance">Time & Distance</option>
            <option value="mensuration">Mensuration</option>
            <option value="di">Data Interpretation</option>
            <option value="algebra">Algebra</option>
            <option value="simplification">Simplification & Approximation</option>
            <option value="probability">Probability & PnC</option>
            <option value="misc">Miscellaneous</option>
            <option value="current">Current Affairs</option>
          </select>
          <button id="aptStart" class="primary-btn" onclick="window.__aptStart && window.__aptStart()">Start</button>
          <button id="aptNext" class="secondary" disabled onclick="window.__aptNext && window.__aptNext()">Next</button>
          <input id="aptUrl" placeholder="Load JSON URL" style="flex:1;min-width:200px;padding:6px;border:1px solid var(--border);border-radius:6px" />
          <button id="aptLoadUrl" class="secondary" title="Load questions from URL">Load URL</button>
          <button id="aptPaste" class="secondary" title="Paste JSON">Paste</button>
          <button id="aptSample" class="secondary" title="Load Sample Pack">Sample Pack</button>
        </div>
        <div id="aptStatus" style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
          <div id="aptTimer">⏱ 00:00</div>
          <div id="aptProgress">Q 0/0</div>
          <div id="aptBoard">Score: 0 • Correct: 0/0</div>
        </div>
        <div id="aptQ" class="card" style="padding:12px;background:var(--surface-muted)">
          <div id="aptQuestion" style="font-weight:600;margin-bottom:8px"></div>
          <div id="aptOptions" style="display:grid;gap:8px"></div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button id="aptSubmit" class="primary-btn" disabled onclick="window.__aptSubmit && window.__aptSubmit()">Submit</button>
            <div id="aptFeedback" style="color:var(--text-muted)"></div>
          </div>
        </div>
      `;
      gamesSection.innerHTML = '';
      gamesSection.appendChild(card);
      try { Aptitude.wire(); } catch(_) {}
    }
  } catch(e) { console.warn('Failed to rebuild games section', e); }

  /* ============================================================
     AI VOICE ENGINE (WEB SPEECH API)
  ============================================================ */

  const VoiceEngine = {
    voices: [],
    ready: false,

    init() {
      const load = () => {
        this.voices = speechSynthesis.getVoices();
        this.ready = true;
      };
      load();
      speechSynthesis.onvoiceschanged = load;
    },

    speak(text, emotion = "calm") {
      if (!this.ready || !text) return;

      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);

      // Prefer English female voice if available
      utter.voice =
        this.voices.find(v => v.lang.startsWith("en") && v.name.includes("Female")) ||
        this.voices.find(v => v.lang.startsWith("en")) ||
        this.voices[0];

      // Emotion simulation
      switch (emotion) {
        case "happy":
          utter.pitch = 1.4;
          utter.rate = 1.2;
          break;
        case "warning":
          utter.pitch = 0.8;
          utter.rate = 0.85;
          break;
        case "urgent":
          utter.pitch = 1.1;
          utter.rate = 1.35;
          break;
        default:
          utter.pitch = 1;
          utter.rate = 1;
      }

      utter.volume = 1;
      speechSynthesis.speak(utter);
    }
  };

  VoiceEngine.init();

  /* ============================================================
     GLOBAL GAME CORE
  ============================================================ */

  const GameCore = {
    score: 0,
    streak: 0,
    difficulty: 1,
    history: [],
    riskMode: false,
    listeners: new Set(),
    combo: 1,
    comboWindowMs: 6000,
    comboExpireAt: 0,
    dailyGoal: 100,
    dailyProgress: 0,
    lastDailyKey: '',
    coins: 0,
    sessionCoins: 0,
    bestStreak: Number(localStorage.getItem('minddesk_games_beststreak')||0),

    addScore(points) {
      const mult = this.riskMode ? 2 : 1;
      if (points > 0) {
        const now = Date.now();
        if (now < this.comboExpireAt) {
          this.combo = Math.min(5, this.combo + 1);
        } else {
          this.combo = 1;
        }
        this.comboExpireAt = now + this.comboWindowMs;
      } else if (points < 0) {
        this.combo = 1;
      }
      const delta = points * mult * this.combo;
      this.score += delta;
      this.streak = points > 0 ? this.streak + 1 : 0;
      if (points > 0 && this.streak > 0 && this.streak % 3 === 0) {
        this.score += 2 * mult;
        this.log("system", `streak_bonus_${this.streak}`);
        showToast(`Streak ${this.streak}! Bonus +${2 * mult}`);
      }
      this.adjustDifficulty(points);
      if (delta > 0) this.addDaily(delta);
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
        localStorage.setItem('minddesk_games_beststreak', String(this.bestStreak));
      }
      if (delta > 0) {
        const coins = Math.max(1, Math.round(delta/10));
        this.addCoins(coins);
      }
      this.emit();
    },

    adjustDifficulty(delta) {
      if (delta > 0) this.difficulty = Math.min(5, this.difficulty + 0.2);
      else this.difficulty = Math.max(1, this.difficulty - 0.2);
    },

    log(game, action) {
      this.history.push({
        game,
        action,
        score: this.score,
        ts: new Date().toISOString()
      });
    },

    on(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); },
    emit() { this.listeners.forEach(cb => { try { cb(this); } catch(_){} }); },
    ensureDaily() {
      const d = new Date();
      const key = d.toISOString().slice(0,10);
      if (this.lastDailyKey !== key) {
        this.lastDailyKey = key;
        const saved = JSON.parse(localStorage.getItem('minddesk_games_daily')||'{}');
        if (saved.key === key) {
          this.dailyProgress = saved.progress||0;
        } else {
          this.dailyProgress = 0;
          localStorage.setItem('minddesk_games_daily', JSON.stringify({ key, progress: 0 }));
        }
      }
    },
    addDaily(amount) {
      this.ensureDaily();
      this.dailyProgress += amount;
      localStorage.setItem('minddesk_games_daily', JSON.stringify({ key: this.lastDailyKey, progress: this.dailyProgress }));
      if (this.dailyProgress >= this.dailyGoal) {
        showToast('Daily Challenge Complete! ⭐ +50 Coins');
        this.addCoins(50);
      }
    },
    addCoins(n){
      this.coins = Number(localStorage.getItem('minddesk_games_coins')||0);
      this.coins += n;
      this.sessionCoins += n;
      localStorage.setItem('minddesk_games_coins', String(this.coins));
    }
  };

  /* ============================================================
     TIMER HELPER
  ============================================================ */

  function startTimer(seconds, onTick, onEnd) {
    let t = seconds;
    onTick(t);
    const id = setInterval(() => {
      t--;
      onTick(t);
      if (t <= 0) {
        clearInterval(id);
        onEnd();
      }
    }, 1000);
    return () => clearInterval(id);
  }

  /* ============================================================
     TAB HANDLING
  ============================================================ */

  const tabs = document.querySelectorAll(".game-tab");
  const screens = document.querySelectorAll(".game-screen");

  tabs.forEach(tab => {
    tab.onclick = () => {
      try { speechSynthesis.cancel(); } catch(_) {}
      tabs.forEach(t => {
        t.classList.remove("primary-btn");
        t.classList.add("secondary");
      });
      tab.classList.add("primary-btn");
      tab.classList.remove("secondary");

      screens.forEach(s => (s.style.display = "none"));
      const target = document.getElementById("game_" + tab.dataset.game);
      if (target) target.style.display = "block";
    };
  });

  // Ensure a default game is visible on load
  (function ensureDefaultTab(){
    const active = document.querySelector('.game-tab.primary-btn');
    if (!active && tabs[0]) tabs[0].click();
  })();

  let hud;
  function mountHUD() {
    const card = document.querySelector('#games .card') || document.querySelector('#gameArea')?.parentElement;
    if (!card || hud) return;
    hud = document.createElement('div');
    hud.style.display = 'flex';
    hud.style.alignItems = 'center';
    hud.style.justifyContent = 'space-between';
    hud.style.gap = '10px';
    hud.style.margin = '8px 0 10px 0';
    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.gap = '10px';
    const scoreEl = document.createElement('div');
    const streakEl = document.createElement('div');
    const diffEl = document.createElement('div');
    const bestEl = document.createElement('div');
    const coinsEl = document.createElement('div');
    scoreEl.id = 'hudScore'; streakEl.id = 'hudStreak'; diffEl.id = 'hudDiff';
    bestEl.id = 'hudBest'; coinsEl.id = 'hudCoins';
    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';
    const riskBtn = document.createElement('button');
    riskBtn.className = 'secondary';
    riskBtn.textContent = 'Risk x2: OFF';
    riskBtn.type = 'button';
    riskBtn.onclick = () => {
      GameCore.riskMode = !GameCore.riskMode;
      riskBtn.textContent = `Risk x2: ${GameCore.riskMode ? 'ON' : 'OFF'}`;
      showToast(GameCore.riskMode ? 'Risk Mode Enabled: rewards and penalties doubled' : 'Risk Mode Disabled');
    };
    const comboWrap = document.createElement('div');
    comboWrap.style.display='flex';
    comboWrap.style.alignItems='center';
    comboWrap.style.gap='6px';
    const comboLabel = document.createElement('div');
    comboLabel.id='hudCombo';
    const comboBar = document.createElement('div');
    comboBar.style.width='120px';
    comboBar.style.height='6px';
    comboBar.style.borderRadius='999px';
    comboBar.style.background='var(--surface-muted)';
    const comboFill = document.createElement('div');
    comboFill.id='hudComboFill';
    comboFill.style.height='100%';
    comboFill.style.width='0%';
    comboFill.style.borderRadius='999px';
    comboFill.style.background='linear-gradient(90deg,#22c55e,#eab308)';
    comboBar.appendChild(comboFill);
    comboWrap.append(comboLabel, comboBar);

    const badge = document.createElement('button');
    badge.id='dailyBadge';
    badge.className='secondary';
    badge.type='button';
    badge.textContent='Daily ⭐ 0/100';
    badge.onclick=()=>showToast('Earn ⭐ by scoring points today. Goal 100 for +50 Coins!');

    const endBtn = document.createElement('button');
    endBtn.className='secondary';
    endBtn.type='button';
    endBtn.textContent='End Session';
    endBtn.onclick=()=>showSummary();
    right.append(riskBtn, comboWrap, badge, endBtn);
    left.append(scoreEl, streakEl, bestEl, diffEl, coinsEl);
    hud.append(left, right);
    const area = document.getElementById('gameArea');
    if (area && area.parentElement) {
      area.parentElement.insertBefore(hud, area);
    } else if (card) {
      card.insertBefore(hud, card.firstChild);
    }
    const update = () => {
      scoreEl.textContent = `Score: ${GameCore.score}`;
      streakEl.textContent = `Streak: ${GameCore.streak}`;
      diffEl.textContent = `Difficulty: ${GameCore.difficulty.toFixed(1)}`;
      bestEl.textContent = `Best Streak: ${GameCore.bestStreak}`;
      coinsEl.textContent = `Coins: ${Number(localStorage.getItem('minddesk_games_coins')||0)}`;
      GameCore.ensureDaily();
      const now = Date.now();
      const remaining = Math.max(0, GameCore.comboExpireAt - now);
      const pct = Math.min(100, Math.round(remaining / GameCore.comboWindowMs * 100));
      document.getElementById('hudCombo').textContent = `Combo x${GameCore.combo}`;
      document.getElementById('hudComboFill').style.width = `${pct}%`;
      const dp = Math.min(GameCore.dailyGoal, Math.round(GameCore.dailyProgress));
      document.getElementById('dailyBadge').textContent = `Daily ⭐ ${dp}/${GameCore.dailyGoal}`;
    };
    update();
    GameCore.on(update);
    setInterval(update, 200);
  }

  function showSummary(){
    let modal=document.getElementById('gamesSummary');
    if (!modal){
      modal=document.createElement('div');
      modal.id='gamesSummary';
      modal.style.position='fixed';
      modal.style.inset='0';
      modal.style.background='rgba(0,0,0,0.4)';
      modal.style.zIndex='3000';
      const box=document.createElement('div');
      box.style.position='absolute';
      box.style.left='50%';
      box.style.top='50%';
      box.style.transform='translate(-50%,-50%)';
      box.style.background='var(--surface)';
      box.style.border='1px solid var(--border)';
      box.style.borderRadius='12px';
      box.style.minWidth='280px';
      box.style.maxWidth='420px';
      box.style.padding='16px';
      const title=document.createElement('h3');
      title.textContent='Session Summary';
      title.style.margin='0 0 8px 0';
      const body=document.createElement('div');
      body.id='gamesSummaryBody';
      const actions=document.createElement('div');
      actions.style.display='flex';
      actions.style.justifyContent='flex-end';
      actions.style.gap='8px';
      const close=document.createElement('button');
      close.className='secondary';
      close.type='button';
      close.textContent='Close';
      close.onclick=()=>modal.remove();
      actions.appendChild(close);
      box.append(title, body, actions);
      modal.appendChild(box);
      document.body.appendChild(modal);
    }
    const coins = Number(localStorage.getItem('minddesk_games_coins')||0);
    const body = document.getElementById('gamesSummaryBody');
    if (body){
      body.innerHTML = `
        <div style="display:grid;gap:6px">
          <div>Total Score: <strong>${GameCore.score}</strong></div>
          <div>Best Streak: <strong>${GameCore.bestStreak}</strong></div>
          <div>Daily Progress: <strong>${Math.round(GameCore.dailyProgress)}/${GameCore.dailyGoal}</strong></div>
          <div>Coins (total): <strong>${coins}</strong> <span style="color:var(--text-muted)">(this session +${GameCore.sessionCoins})</span></div>
        </div>
      `;
    }
  }

  function showToast(text) {
    let layer = document.getElementById('toastLayer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'toastLayer';
      layer.style.position = 'fixed';
      layer.style.right = '18px';
      layer.style.bottom = '18px';
      layer.style.zIndex = '2000';
      layer.style.display = 'flex';
      layer.style.flexDirection = 'column';
      layer.style.gap = '8px';
      document.body.appendChild(layer);
    }
    const n = document.createElement('div');
    n.className = 'toast';
    n.style.background = 'var(--surface)';
    n.style.border = '1px solid var(--border)';
    n.style.padding = '8px 10px';
    n.style.borderRadius = '8px';
    n.style.boxShadow = 'var(--shadow-md)';
    n.textContent = text;
    layer.appendChild(n);
    setTimeout(()=>{ n.style.opacity='0'; n.style.transform='translateX(20px)'; }, 1800);
    setTimeout(()=>{ n.remove(); }, 2300);
  }

  mountHUD();

  // Mascot reactions (if present on dashboard)
  (function wireMascot(){
    const bubble = document.getElementById('mascotBubble');
    const masc = document.getElementById('mascot');
    if (!bubble || !masc) return;
    let prevScore = GameCore.score;
    let prevStreak = GameCore.streak;
    const cheers = ["Nice! 🎉","Great job!","Keep it up!","Boom! +"+1];
    const hurts = ["Oops — review that one","Try again!","You'll get the next one"];

    GameCore.on(state=>{
      const delta = state.score - prevScore;
      if (delta > 0) {
        const text = state.streak && state.streak % 3 === 0 ? `Streak ${state.streak}!` : `+${delta} points`;
        bubble.textContent = cheers[Math.floor(Math.random()*cheers.length)].replace('+1', `+${delta}`) + ' ' + text;
      } else if (delta < 0) {
        bubble.textContent = hurts[Math.floor(Math.random()*hurts.length)];
      }
      if (state.streak !== prevStreak && state.streak > prevStreak) {
        bubble.textContent = `Streak x${state.streak}! Keep going!`;
      }
      prevScore = state.score; prevStreak = state.streak;
      // auto-clear after a few seconds
      setTimeout(()=>{ try{ bubble.textContent = 'Hi! 🎉 Try a practice'; }catch(_){} }, 4200);
    });

    masc.addEventListener('click', ()=>{
      bubble.textContent = ['You got this!','Try a quick 10-min drill','Focus on one topic today'][Math.floor(Math.random()*3)];
    });
  })();

  /* ============================================================
     GAME 1: REACTION TIME (VOICE ENABLED)
  ============================================================ */

  (function reactionGame() {
    const start = document.getElementById("reactionStart");
    const box = document.getElementById("reactionBox");
    const res = document.getElementById("reactionResult");
    let startTime, active = false;

    start.onclick = () => {
      active = false;
      res.textContent = "";
      box.textContent = "Wait...";
      box.style.background = "#ddd";

      VoiceEngine.speak("Get ready. Wait for green.", "calm");

      setTimeout(() => {
        box.style.background = "#22c55e";
        box.textContent = "CLICK!";
        startTime = performance.now();
        active = true;
        VoiceEngine.speak("Now!", "urgent");
      }, 800 + Math.random() * 2000);
    };

    box.onclick = () => {
      if (!active) {
        GameCore.addScore(-5);
        VoiceEngine.speak("Too early. Penalty applied.", "warning");
        res.textContent = "❌ Too early (−5)";
        return;
      }
      const rt = Math.round(performance.now() - startTime);
      const pts = rt < 250 ? 10 : rt < 400 ? 5 : -5;
      GameCore.addScore(pts);

      VoiceEngine.speak(
        pts > 0 ? "Good reflexes!" : "Try to be faster.",
        pts > 0 ? "happy" : "warning"
      );

      res.textContent = `⏱ ${rt} ms (${pts > 0 ? "+" : ""}${pts})`;
    };

    const nextBtn = document.getElementById("reactionNext");
    if (nextBtn) {
      nextBtn.onclick = () => goNextFrom("reaction");
    }
  })();

  /* ============================================================
     GAME 2: QUICK MATH (VOICE ENABLED)
  ============================================================ */

  (function quickMath() {
    const q = document.getElementById("mathQuestion");
    const a = document.getElementById("mathAnswer");
    const r = document.getElementById("mathResult");
    const s = document.getElementById("mathSubmit");
    const startBtn = document.getElementById("mathStart");
    const nextBtn = document.getElementById("mathNext");
    let cur = {};

    function next() {
      cur.a = Math.floor(Math.random() * 20) + 1;
      cur.b = Math.floor(Math.random() * 20) + 1;
      q.textContent = `What is ${cur.a} + ${cur.b}?`;
      VoiceEngine.speak(`What is ${cur.a} plus ${cur.b}?`, "calm");
      a.value = "";
    }

    s.onclick = () => {
      const ok = Number(a.value) === cur.a + cur.b;
      const pts = ok ? 5 : -5;
      GameCore.addScore(pts);

      VoiceEngine.speak(
        ok ? "Correct answer!" : "That is incorrect.",
        ok ? "happy" : "warning"
      );

      r.textContent = ok ? "✅ Correct (+5)" : "❌ Wrong (−5)";
      next();
    };

    if (startBtn) startBtn.onclick = () => { r.textContent = ""; next(); };
    if (nextBtn) nextBtn.onclick = () => goNextFrom("quickmath");

    next();
  })();

  /* ============================================================
     GAME NAV HELPERS + REMAINING GAMES
  ============================================================ */

  const gameOrder = [
    "reaction",
    "suspicious",
    "randompick",
    "annoy",
    "wwd",
    "memory",
    "quickmath"
  ];

  function goTo(game) {
    const tab = document.querySelector(`.game-tab[data-game="${game}"]`);
    if (tab) tab.click();
  }

  function goNextFrom(game) {
    const i = gameOrder.indexOf(game);
    if (i >= 0 && i < gameOrder.length - 1) {
      goTo(gameOrder[i + 1]);
    }
  }

  // Suspicious Button game
  (function suspiciousGame() {
    const btn = document.getElementById("suspiciousBtn");
    const out = document.getElementById("suspiciousResult");
    const next = document.getElementById("suspiciousNext");
    if (!btn || !out) return;
    const msgs = [
      "You unleashed confetti! Party mode engaged.",
      "An ancient bell rang softly. Nothing else happened.",
      "A mysterious popup winked and vanished."
    ];
    btn.onclick = () => {
      const m = msgs[Math.floor(Math.random() * msgs.length)];
      out.textContent = m;
      VoiceEngine.speak("Curiosity rewarded.", "happy");
      GameCore.addScore(2);
    };
    if (next) next.onclick = () => goNextFrom("suspicious");
  })();

  // Random Pick game
  (function randomPick() {
    const res = document.getElementById("randompickResult");
    const next = document.getElementById("randompickNext");
    document.querySelectorAll('.pick-img').forEach(b => {
      b.addEventListener('click', () => {
        const k = b.getAttribute('data-pick');
        const map = {
          owl: "Wise and observant.",
          cat: "Independent and composed.",
          rocket: "Ambitious and fast-moving.",
          coffee: "Focused and energized."
        };
        res.textContent = map[k] || "Interesting choice!";
        VoiceEngine.speak(res.textContent, "calm");
        GameCore.addScore(1);
      });
    });
    if (next) next.onclick = () => goNextFrom("randompick");
  })();

  // Annoying Situation game
  (function annoyGame() {
    const res = document.getElementById("annoyResult");
    const next = document.getElementById("annoyNext");
    document.querySelectorAll('.annoy-choice').forEach(b => {
      b.addEventListener('click', () => {
        const c = b.getAttribute('data-choice');
        const map = {
          ignore: ["You kept calm and carried on.", 2, "calm"],
          callout: ["Assertive and fair.", 3, "happy"],
          dramatic: ["Funny, but risky.", -1, "warning"]
        };
        const [text, pts, tone] = map[c] || ["Noted.", 0, "calm"];
        res.textContent = text + ` (${pts >= 0 ? '+' : ''}${pts})`;
        GameCore.addScore(pts);
        VoiceEngine.speak(text, tone);
      });
    });
    if (next) next.onclick = () => goNextFrom("annoy");
  })();

  // What Would You Do? game
  (function wwdGame() {
    const res = document.getElementById("wwdResult");
    const next = document.getElementById("wwdNext");
    document.querySelectorAll('.wwd-choice').forEach(b => {
      b.addEventListener('click', () => {
        const c = b.getAttribute('data-choice');
        const map = {
          eat: ["Bold and decisive.", 2, "happy"],
          ask: ["Considerate and fair.", 3, "calm"],
          share: ["Collaborative mindset.", 4, "happy"]
        };
        const [text, pts, tone] = map[c] || ["Okay.", 0, "calm"];
        res.textContent = text + ` (${pts >= 0 ? '+' : ''}${pts})`;
        GameCore.addScore(pts);
        VoiceEngine.speak(text, tone);
      });
    });
    if (next) next.onclick = () => goNextFrom("wwd");
  })();

  // Memory Sequence game (lightweight Simon)
  (function memoryGame() {
    const wrap = document.getElementById('memWrapper');
    const grid = document.getElementById('memTiles');
    const indicators = document.getElementById('memIndicators');
    const start = document.getElementById('memStart');
    const next = document.getElementById('memNext');
    const reset = document.getElementById('memReset');
    if (!wrap || !grid || !start) return;

    const colors = ['#ef4444','#22c55e','#3b82f6','#f59e0b'];
    const tiles = [];
    const seq = [];
    let inputIndex = 0;
    let accepting = false;

    function ensureTiles() {
      if (grid.children.length) return;
      for (let i=0;i<4;i++) {
        const d = document.createElement('div');
        d.style.width = '60px';
        d.style.height = '60px';
        d.style.borderRadius = '8px';
        d.style.background = colors[i];
        d.style.opacity = '0.8';
        d.style.cursor = 'pointer';
        d.dataset.idx = String(i);
        grid.appendChild(d);
        tiles.push(d);
      }
    }

    function flash(idx) {
      const el = tiles[idx];
      if (!el) return;
      el.style.opacity = '1';
      setTimeout(()=>{ el.style.opacity = '0.8'; }, 250);
    }

    
    function addStep() {
      seq.push(Math.floor(Math.random()*4));
      renderIndicators();
    }

    function renderIndicators() {
      indicators.innerHTML = '';
      seq.forEach((_,i)=>{
        const dot=document.createElement('div');
        dot.style.width='10px';dot.style.height='10px';
        dot.style.borderRadius='999px';
        dot.style.background=i<inputIndex? '#22c55e':'#94a3b8';
        indicators.appendChild(dot);
      });
    }

    function playSeq() {
      accepting = false;
      inputIndex = 0;
      let t=0;
      seq.forEach((n)=>{
        setTimeout(()=>flash(n), t);
        t+=500;
      });
      setTimeout(()=>{ accepting = true; }, t+50);
    }

    function resetAll() {
      seq.length = 0;
      inputIndex = 0;
      indicators.innerHTML = '';
      GameCore.addScore(0);
    }

    ensureTiles();

    grid.addEventListener('click', (e)=>{
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const idx = Number(t.dataset.idx);
      if (!accepting || Number.isNaN(idx)) return;
      flash(idx);
      if (idx === seq[inputIndex]) {
        inputIndex++;
        renderIndicators();
        if (inputIndex === seq.length) {
          GameCore.addScore(5);
          VoiceEngine.speak('Great memory!', 'happy');
          accepting = false;
        }
      } else {
        GameCore.addScore(-5);
        VoiceEngine.speak('Wrong tile. Try again.', 'warning');
        accepting = false;
        setTimeout(playSeq, 500);
      }
    });

    if (start) start.onclick = () => { resetAll(); addStep(); playSeq(); };
    if (next) next.onclick = () => { addStep(); playSeq(); };
    if (reset) reset.onclick = () => { resetAll(); };
  })();

  /* ============================================================
     GAME 3: SITUATIONAL JUDGEMENT (VOICE + EMOTION)
  ============================================================ */

  (function situationalGame() {
    const screen = document.createElement("div");
    screen.id = "game_sjt";
    screen.className = "game-screen";
    screen.style.display = "none";
    document.getElementById("gameArea").appendChild(screen);

    const situations = [
      {
        text: "An AI flags a student for cheating with low confidence.",
        options: [
          ["Manual review", 10, "happy"],
          ["Trust AI blindly", -10, "warning"],
          ["Delay decision", 5, "calm"]
        ]
      },
      {
        text: "AI triage marks a patient low risk despite warning signs.",
        options: [
          ["Override AI", 15, "urgent"],
          ["Follow AI", -20, "warning"],
          ["Wait approval", -5, "calm"]
        ]
      }
    ];

    let i = 0, stopTimer;

    function render() {
      if (i >= situations.length) {
        screen.innerHTML = `<h3>Completed</h3><p>Score: ${GameCore.score}</p>`;
        VoiceEngine.speak("Assessment complete.", "calm");
        return;
      }

      const s = situations[i];
      screen.innerHTML = `
        <h3>Situational Judgement</h3>
        <p>${s.text}</p>
        <div id="opts"></div>
        <div>⏱ <span id="t">20</span>s</div>
      `;

      VoiceEngine.speak(s.text, "calm");

      const opts = screen.querySelector("#opts");
      s.options.forEach(o => {
        const b = document.createElement("button");
        b.className = "secondary";
        b.textContent = o[0];
        b.onclick = () => {
          stopTimer();
          GameCore.addScore(o[1]);
          VoiceEngine.speak(
            o[1] > 0 ? "Good ethical decision." : "Risky choice.",
            o[2]
          );
          i++;
          render();
        };
        opts.appendChild(b);
      });

      stopTimer = startTimer(
        Math.max(8, 20 - GameCore.difficulty * 2),
        t => (screen.querySelector("#t").textContent = t),
        () => {
          GameCore.addScore(-5);
          VoiceEngine.speak("Time is up.", "warning");
          i++;
          render();
        }
      );
    }

    render();
  })();

});
