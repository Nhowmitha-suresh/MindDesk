// Lightweight 3D aptitude chart using Three.js
(function(){
  function getStats(){
    try{
      let stats = JSON.parse(localStorage.getItem('minddesk_apt_stats')||'{}');
      // seed sample stats if none present to improve first-run UX
      if (!stats || Object.keys(stats).length === 0) {
        stats = {
          number_systems: { correct: 32, total: 40 },
          arithmetic: { correct: 24, total: 30 },
          percentages: { correct: 18, total: 24 },
          time_work: { correct: 12, total: 20 },
          mensuration: { correct: 8, total: 12 }
        };
        try { localStorage.setItem('minddesk_apt_stats', JSON.stringify(stats)); } catch(e){}
      }
      const topics = Object.keys(stats);
      if (!topics.length) return { topics: ['No Data'], acc: [0] };
      const acc = topics.map(t=>{
        const s = stats[t]||{}; const c = s.correct||0; const tot = s.total||0; return tot? Math.round(c/tot*100):0;
      });
      return { topics, acc };
    }catch(e){ return { topics:['No Data'], acc:[0] } }
  }

  function clearContainer(c){
    if (!c) return;
    if (c._three){ try{ c._three.renderer.dispose(); }catch(e){} c._three = null; }
    c.innerHTML = '';
  }

  function render(){
    const container = document.getElementById('apt3d');
    if (!container) return;
    const { topics, acc } = getStats();
    clearContainer(container);

    // create scene
    const scene = new THREE.Scene();
    const w = container.clientWidth || container.offsetWidth || 800;
    const h = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 2000);
    camera.position.set(0, Math.max(6, Math.max(...acc)/10 + 6), Math.max(12, topics.length*1.5));

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio||1);
    container.appendChild(renderer.domElement);

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6); dir.position.set(5,10,7); scene.add(dir);

    // ground grid
    const grid = new THREE.GridHelper(40, 40, 0x444444, 0x222222); grid.position.y = 0; scene.add(grid);

    // bars
    const group = new THREE.Group();
    const spacing = 1.6;
    for (let i=0;i<topics.length;i++){
      const pct = acc[i] || 0;
      const height = Math.max(0.2, pct/10); // scale
      const geom = new THREE.BoxGeometry(1, height, 1);
      const color = new THREE.Color().setHSL((0.4 - pct/200), 0.7, 0.5);
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.x = (i - (topics.length-1)/2) * spacing;
      mesh.position.y = height/2 + 0.01;
      mesh.position.z = 0;
      group.add(mesh);

      // add a DOM label below each bar
      const label = document.createElement('div');
      label.className = 'apt3d-label';
      label.style.position = 'absolute';
      label.style.pointerEvents = 'none';
      label.style.fontSize = '12px';
      label.style.color = 'var(--text)';
      label.style.width = '120px';
      label.style.textAlign = 'center';
      label.textContent = `${topics[i]} — ${pct}%`;
      container.appendChild(label);
      // store label for update
      mesh.userData._label = label;
    }
    scene.add(group);

    // simple orbit-like rotation
    let angle = 0;
    function animate(){
      angle += 0.005;
      group.rotation.y = Math.sin(angle)*0.25;
      renderer.render(scene, camera);
      // update labels positions
      group.children.forEach(m=>{
        const v = m.position.clone();
        m.updateMatrixWorld();
        const pos = m.getWorldPosition(new THREE.Vector3());
        const proj = pos.clone().project(camera);
        const x = (proj.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (-proj.y * 0.5 + 0.5) * renderer.domElement.clientHeight + 60;
        if (m.userData._label){ m.userData._label.style.left = Math.round(x - 60) + 'px'; m.userData._label.style.top = Math.round(y) + 'px'; }
      });
      container._three._raf = requestAnimationFrame(animate);
    }

    // responsive
    function onResize(){
      const ww = container.clientWidth || w; const hh = container.clientHeight || h;
      camera.aspect = ww/hh; camera.updateProjectionMatrix(); renderer.setSize(ww, hh);
    }
    window.addEventListener('resize', onResize);

    container._three = { scene, camera, renderer, group };
    container.style.position = 'relative';
    animate();
  }

  // expose
  window.renderApt3D = render;
  // auto-render when script loads
  try{ setTimeout(()=>{ if (document.body && document.body.dataset.page === 'dashboard') render(); }, 300); } catch(e){}
})();
