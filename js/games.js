// Multi-game module: Reaction, Memory Sequence, Quick Math
(function(){
  // Helper: safe get
  const $ = sel => document.querySelector(sel);

  /* --------------------
     Reaction Time
  --------------------*/
  (function(){
    const start = $('#reactionStart');
    const box = $('#reactionBox');
    const result = $('#reactionResult');
    if (!start || !box || !result) return;

    let timeout = null;
    let startTime = 0;
    let running = false;

    function reset() {
      running = false;
      box.style.background = '#ddd';
      box.textContent = 'Wait...';
      result.textContent = '';
      if (timeout) { clearTimeout(timeout); timeout = null; }
      start.disabled = false;
    }

    start.addEventListener('click', () => {
      reset();
      start.disabled = true;
      const delay = 800 + Math.floor(Math.random() * 2200);
      timeout = setTimeout(() => {
        box.style.background = '#10b981';
        box.textContent = 'CLICK!';
        startTime = performance.now();
        running = true;
        start.disabled = false;
      }, delay);
    });

    box.addEventListener('click', () => {
      if (!running) {
        result.textContent = 'Too soon — wait for the color.';
        reset();
        return;
      }
      const reaction = Math.round(performance.now() - startTime);
      result.textContent = `Reaction time: ${reaction} ms`;
      // save to localStorage
      try {
        const key = 'minddesk_game_reactions';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ ts: new Date().toISOString(), reaction });
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (e) { }
      reset();
    });
  })();

  /* --------------------
     Memory Sequence
  --------------------*/
  (function(){
    const tilesWrap = $('#memTiles');
    const startBtn = $('#memStart');
    const resetBtn = $('#memReset');
    const result = $('#memResult');
    if (!tilesWrap || !startBtn || !resetBtn || !result) return;

    const colors = ['#f59e0b','#60a5fa','#34d399','#f472b6'];
    const seq = [];
    let playerTurn = false;

    function renderTiles() {
      tilesWrap.innerHTML = '';
      colors.forEach((c,i)=>{
        const t = document.createElement('div');
        t.style.width = '64px'; t.style.height = '64px'; t.style.borderRadius='8px';
        t.style.background = '#eee'; t.style.display='flex'; t.style.alignItems='center'; t.style.justifyContent='center';
        t.style.cursor='pointer'; t.dataset.idx = i;
        t.addEventListener('click', onTileClick);
        tilesWrap.appendChild(t);
      });
    }

    function flashTile(i, dur=600) {
      const tile = tilesWrap.querySelector(`[data-idx='${i}']`);
      if (!tile) return Promise.resolve();
      return new Promise(res=>{
        const orig = tile.style.background;
        tile.style.background = colors[i];
        setTimeout(()=>{ tile.style.background = orig; res(); }, dur);
      });
    }

    async function playSequence() {
      playerTurn = false;
      result.textContent = 'Watch the sequence...';
      for (let i=0;i<seq.length;i++){
        await flashTile(seq[i], 600);
        await new Promise(r=>setTimeout(r,180));
      }
      playerTurn = true;
      result.textContent = 'Your turn: repeat the sequence.';
    }

    function onTileClick(e){
      if (!playerTurn) return;
      const idx = Number(e.currentTarget.dataset.idx);
      // play quick flash
      flashTile(idx,200);
      const expected = seq.shift();
      if (expected !== idx) {
        result.textContent = 'Incorrect — sequence ended.';
        playerTurn = false;
        seq.length = 0;
        return;
      }
      if (seq.length === 0) {
        result.textContent = 'Correct! Next round.';
        // record success
        try {
          const key = 'minddesk_game_memory';
          const arr = JSON.parse(localStorage.getItem(key) || '[]');
          arr.push({ ts: new Date().toISOString(), success: true });
          localStorage.setItem(key, JSON.stringify(arr));
        } catch(e){}
        // start next round after small delay
        setTimeout(()=> nextRound(), 900);
      }
    }

    function nextRound(){
      // push a random tile to sequence and play
      const idx = Math.floor(Math.random()*colors.length);
      seq.push(idx);
      // clone seq for checking in onTileClick
      const seqClone = seq.slice();
      // replace seq with clone for player's checking
      seq.length = 0; seq.push(...seqClone);
      playSequence();
    }

    startBtn.addEventListener('click', ()=>{
      seq.length = 0; nextRound();
    });

    // Next button forces the next round when ready
    const memNextBtn = document.getElementById('memNext');
    if (memNextBtn) memNextBtn.addEventListener('click', ()=> { if (!playerTurn) { nextRound(); } });

    resetBtn.addEventListener('click', ()=>{
      seq.length = 0; playerTurn=false; result.textContent='';
    });

    renderTiles();
  })();

  /* --------------------
     Quick Math
  --------------------*/
  (function(){
    const qEl = $('#mathQuestion');
    const input = $('#mathAnswer');
    const submit = $('#mathSubmit');
    const start = $('#mathStart');
    const result = $('#mathResult');
    if (!qEl || !input || !submit || !start || !result) return;

    let current = null;

    function newQuestion(){
      const a = Math.floor(Math.random()*20)+1;
      const b = Math.floor(Math.random()*20)+1;
      current = { a, b, answer: a+b };
      qEl.textContent = `What is ${a} + ${b}?`;
      input.value = '';
      result.textContent = '';
    }

    submit.addEventListener('click', ()=>{
      const val = Number(input.value);
      if (Number.isNaN(val)) return result.textContent = 'Please enter a number.';
      const ok = val === current.answer;
      result.textContent = ok ? 'Correct!' : `Incorrect — answer is ${current.answer}`;
      // save result
      try{
        const key = 'minddesk_game_math';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ ts: new Date().toISOString(), correct: ok });
        localStorage.setItem(key, JSON.stringify(arr));
      }catch(e){}
    });

    start.addEventListener('click', ()=> newQuestion());
    // initialize
    newQuestion();
  })();

  // optional Math Next button
  const mathNextBtn = document.getElementById('mathNext');
  if (mathNextBtn) mathNextBtn.addEventListener('click', ()=> { const startBtn = document.getElementById('mathStart'); if (startBtn) startBtn.click(); });

  /* --------------------
     Tab handling for games UI
  --------------------*/
  (function(){
    const tabs = document.querySelectorAll('.game-tab');
    tabs.forEach(t=> t.addEventListener('click', ()=>{
      tabs.forEach(x=> x.classList.remove('primary-btn'));
      tabs.forEach(x=> x.classList.add('secondary'));
      t.classList.remove('secondary'); t.classList.add('primary-btn');
      const g = t.dataset.game;
      document.querySelectorAll('.game-screen').forEach(s=> s.style.display = 'none');
      const active = document.getElementById('game_'+g);
      if (active) active.style.display = 'block';
    }));
  })();

  /* --------------------
     New playful micro-games
  --------------------*/
  (function(){
    // Suspicious Button
    const sBtn = $('#suspiciousBtn');
    const sRes = $('#suspiciousResult');
    if (sBtn && sRes) {
      sBtn.addEventListener('click', ()=>{
        const reactions = [
          "You couldn't help it — instant legend.",
          "Brave move. Or foolish. Either works.",
          "That was definitely worth the existential crisis."
        ];
        const msg = reactions[Math.floor(Math.random()*reactions.length)];
        sRes.textContent = msg;
        try { const key = 'minddesk_game_suspicious'; const arr = JSON.parse(localStorage.getItem(key)||'[]'); arr.push({ts:new Date().toISOString(),msg}); localStorage.setItem(key,JSON.stringify(arr)); } catch(e){}
      });
      // Next resets the message for another try
      const sNext = $('#suspiciousNext');
      if (sNext) sNext.addEventListener('click', ()=> { sRes.textContent = ''; });
    }

    // Random Pick
    const pickBtns = document.querySelectorAll('.pick-img');
    const pickRes = $('#randompickResult');
    const pickMap = { owl: 'Night-thinker — quietly observant', cat: 'Independent & curious', rocket: 'Ambitious dreamer', coffee: 'Practical energizer' };
    pickBtns.forEach(b => b.addEventListener('click', ()=>{
      const k = b.dataset.pick; const txt = pickMap[k] || 'Unique pick!';
      if (pickRes) pickRes.textContent = txt;
      try { const key='minddesk_game_pick'; const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.push({ts:new Date().toISOString(),pick:k}); localStorage.setItem(key,JSON.stringify(arr)); } catch(e){}
    }));
    const pickNext = $('#randompickNext'); if (pickNext) pickNext.addEventListener('click', ()=> { if (pickRes) pickRes.textContent = ''; });

    // Annoying Situation
    const annoyBtns = document.querySelectorAll('.annoy-choice');
    const annoyRes = $('#annoyResult');
    annoyBtns.forEach(b => b.addEventListener('click', ()=>{
      const c = b.dataset.choice;
      const map = {
        ignore: 'Zen mode: you conserve energy and dignity.',
        callout: 'Polite warrior: you value fairness.',
        dramatic: 'Comedic relief: the world needed that laugh.'
      };
      const out = map[c] || 'You did you.';
      if (annoyRes) annoyRes.textContent = out;
      try { const key='minddesk_game_annoy'; const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.push({ts:new Date().toISOString(),choice:c}); localStorage.setItem(key,JSON.stringify(arr)); } catch(e){}
    }));
    const annoyNext = $('#annoyNext'); if (annoyNext) annoyNext.addEventListener('click', ()=> { if (annoyRes) annoyRes.textContent = ''; });

    // What Would You Do
    const wwdBtns = document.querySelectorAll('.wwd-choice');
    const wwdRes = $('#wwdResult');
    wwdBtns.forEach(b => b.addEventListener('click', ()=>{
      const ch = b.dataset.choice;
      const map = {
        eat: 'Snack-first: you prioritize joy and impulsive comfort — Certified Impulsive Snacker.',
        ask: 'Curious and social — you seek clarity.',
        share: 'Generous connector — you think of others first.'
      };
      const out = map[ch] || 'Unique approach — nice!';
      if (wwdRes) wwdRes.textContent = out;
      try { const key='minddesk_game_wwd'; const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.push({ts:new Date().toISOString(),choice:ch}); localStorage.setItem(key,JSON.stringify(arr)); } catch(e){}
    }));
    const wwdNext = $('#wwdNext'); if (wwdNext) wwdNext.addEventListener('click', ()=> { if (wwdRes) wwdRes.textContent = ''; });
  })();

})();
