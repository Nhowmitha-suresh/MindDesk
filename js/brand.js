// Interactive brain logo and floating characters
(function(){
  // Logo pupil tracking and blink
  const svg = document.getElementById('minddesk_logo');
  if (!svg) return;

  const eyeL = svg.querySelector('#pupilL');
  const eyeR = svg.querySelector('#pupilR');
  const eyesGroup = svg.querySelector('#eyes');
  const smile = svg.querySelector('#smile');

  // blink periodically by scaling the eye white group
  function blink() {
    if (!eyesGroup) return;
    eyesGroup.classList.add('blink');
    setTimeout(()=> eyesGroup.classList.remove('blink'), 180);
  }
  setInterval(blink, 4000 + Math.random()*2000);

  // Track mouse to move pupils slightly
  document.addEventListener('mousemove', (e)=>{
    try {
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const max = 1.6; // max pupil displacement
      if (eyeL) eyeL.setAttribute('transform', `translate(${dx*max},${dy*max})`);
      if (eyeR) eyeR.setAttribute('transform', `translate(${dx*max},${dy*max})`);
    } catch (e) { }
  });

  // simple hover swag: wink on click
  svg.addEventListener('click', ()=>{
    if (!smile) return;
    smile.style.transform = 'translateY(-2px) scale(1.02)';
    setTimeout(()=> smile.style.transform = '', 250);
  });

  // Floating characters: spawn a few brains that animate across the UI
  const container = document.getElementById('floatingChars');
  if (!container) return;

  function spawnBrain(delay) {
    const el = document.createElement('div');
    el.className = 'float-brain brain-bob';
    el.style.top = (8 + Math.random()*68) + 'vh';
    el.style.left = '-8%';
    el.style.animationDuration = (10 + Math.random()*8) + 's';
    const id = 'b' + Math.floor(Math.random()*100000);
    el.innerHTML = `
      <svg class="brain-char" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="g-${id}" x1="0" x2="1">
            <stop offset="0" stop-color="#8b5cf6"/>
            <stop offset="1" stop-color="#06b6d4"/>
          </linearGradient>
        </defs>
        <!-- body -->
        <g class="brain-body">
          <ellipse cx="24" cy="22" rx="18" ry="14" fill="url(#g-${id})" stroke="rgba(0,0,0,0.06)"/>
        </g>
        <!-- arms -->
        <g class="brain-arms">
          <rect class="brain-arm left" x="2" y="20" width="6" height="6" rx="3" fill="#fff" opacity="0.9" transform="rotate(-18 5 23)" />
          <rect class="brain-arm right" x="40" y="20" width="6" height="6" rx="3" fill="#fff" opacity="0.9" transform="rotate(18 43 23)" />
        </g>
        <!-- legs -->
        <g class="brain-legs">
          <rect class="brain-leg left" x="14" y="34" width="6" height="8" rx="3" fill="#fff" opacity="0.95" />
          <rect class="brain-leg right" x="28" y="34" width="6" height="8" rx="3" fill="#fff" opacity="0.95" />
        </g>
        <!-- face -->
        <g class="brain-face">
          <g class="brain-eye left-eye">
            <ellipse class="eye-white" cx="17" cy="20" rx="4" ry="3.4" fill="#fff" />
            <circle class="pupil" cx="17" cy="20" r="1.6" fill="#061826" />
          </g>
          <g class="brain-eye right-eye">
            <ellipse class="eye-white" cx="31" cy="20" rx="4" ry="3.4" fill="#fff" />
            <circle class="pupil" cx="31" cy="20" r="1.6" fill="#061826" />
          </g>
          <path class="smile" d="M18 26 C22 30, 26 30, 30 26" stroke="#061826" stroke-width="1.2" fill="transparent" stroke-linecap="round" />
        </g>
      </svg>`;

    container.appendChild(el);

    // interactions: wave on hover / wink on click
    try {
      const svg = el.querySelector('svg');
      const leftArm = el.querySelector('.brain-arm.left');
      const rightArm = el.querySelector('.brain-arm.right');
      const leftLeg = el.querySelector('.brain-leg.left');
      const rightLeg = el.querySelector('.brain-leg.right');
      const pupils = el.querySelectorAll('.pupil');
      const eyes = el.querySelectorAll('.eye-white');

      el.addEventListener('mouseenter', ()=>{
        if (leftArm) leftArm.classList.add('wave');
        if (rightArm) rightArm.classList.add('wave');
        if (leftLeg) leftLeg.classList.add('kick');
      });
      el.addEventListener('mouseleave', ()=>{
        if (leftArm) leftArm.classList.remove('wave');
        if (rightArm) rightArm.classList.remove('wave');
        if (leftLeg) leftLeg.classList.remove('kick');
      });

      el.addEventListener('click', ()=>{
        // small wink animation by toggling class on face
        const face = el.querySelector('.brain-face');
        if (face) {
          face.classList.add('brain-wink');
          setTimeout(()=> face.classList.remove('brain-wink'), 220);
        }
      });

      // subtle pupil movement over time
      const movePupils = () => {
        pupils.forEach(p => {
          const dx = (Math.random()-0.5) * 1.6;
          const dy = (Math.random()-0.5) * 1.0;
          p.setAttribute('transform', `translate(${dx},${dy})`);
        });
      };
      const pid = setInterval(movePupils, 1200 + Math.random()*2000);

      // remove after lifecycle
      setTimeout(()=>{
        clearInterval(pid);
        try { container.removeChild(el); } catch(e){}
      }, 10000 + Math.random()*8000 + (delay||0));
    } catch (e) { /* ignore interaction errors */ }
  }

  // spawn periodically
  for (let i=0;i<3;i++) spawnBrain(i*800);
  setInterval(()=> spawnBrain(0), 9000);
})();
