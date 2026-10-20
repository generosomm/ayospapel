import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 3D scene ---------- */

const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch {}
if (renderer) {
  try { await Promise.race([document.fonts.load('40px "Special Elite"'), new Promise(r => setTimeout(r, 1500))]); } catch {}
  buildScene();
}

function buildScene() {
  document.documentElement.classList.remove('no-3d');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const CAM_Z = 9;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9dfea, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(3, 7, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc9d4ff, 0.6);
  fill.position.set(-5, 2, 3);
  scene.add(fill);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function tex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }
  function grain(g, w, h, n, dark = 'rgba(90,60,20,0.08)', light = 'rgba(255,240,210,0.10)') {
    for (let i = 0; i < n; i++) {
      g.fillStyle = Math.random() < 0.5 ? dark : light;
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  }
  const TYPE = '"Special Elite", "Courier New", monospace';
  const SANS = '"Schibsted Grotesk", system-ui, sans-serif';
  const MANILA = '#D4B373';

  // Envelope front: typed sticker label
  const frontTex = tex(1024, 704, (g, w, h) => {
    g.fillStyle = MANILA; g.fillRect(0, 0, w, h);
    grain(g, w, h, 9000);
    g.strokeStyle = 'rgba(120,85,30,0.25)'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.save();
    g.translate(92, 104); g.rotate(-0.012);
    g.shadowColor = 'rgba(80,55,15,0.25)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
    g.fillStyle = '#FBF8EE'; g.fillRect(0, 0, 580, 270);
    g.shadowColor = 'transparent';
    g.fillStyle = '#1C2440'; g.font = `56px ${TYPE}`; g.fillText('AP-202610-0042', 34, 82);
    g.font = `40px ${TYPE}`; g.fillText('Sunrise Mini Mart', 34, 148);
    g.fillStyle = '#46506B'; g.font = `32px ${TYPE}`; g.fillText('October 2026', 34, 198);
    g.fillText('Receipts, sales reports', 34, 242);
    g.restore();
    g.fillStyle = 'rgba(40,30,15,0.55)'; g.font = `28px ${TYPE}`;
    g.fillText('Received by ____________', 92, 600);
    g.fillStyle = '#2B44C9'; g.font = `800 30px ${SANS}`; g.textAlign = 'right';
    g.fillText('AyosPapel', w - 70, h - 74);
  });

  // Envelope back: flap and string-tie buttons
  const backTex = tex(1024, 704, (g, w, h) => {
    g.fillStyle = MANILA; g.fillRect(0, 0, w, h);
    grain(g, w, h, 9000);
    g.fillStyle = 'rgba(120,85,30,0.12)';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.56); g.lineTo(w, 0); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(110,78,28,0.55)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(8, 8); g.lineTo(w / 2, h * 0.56); g.lineTo(w - 8, 8); g.stroke();
    const btn = (x, y) => {
      g.fillStyle = '#8E6A2E'; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#B48A45'; g.beginPath(); g.arc(x, y, 22, 0, Math.PI * 2); g.fill();
    };
    btn(w / 2, h * 0.53); btn(w / 2, h * 0.82);
    g.strokeStyle = '#F2E8D2'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(w / 2, h * 0.53);
    g.bezierCurveTo(w / 2 + 70, h * 0.6, w / 2 - 70, h * 0.72, w / 2, h * 0.82);
    g.bezierCurveTo(w / 2 + 50, h * 0.86, w / 2 + 80, h * 0.75, w / 2 + 40, h * 0.7);
    g.stroke();
    g.strokeStyle = 'rgba(120,85,30,0.25)'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  });

  function stampTex(word, date, color) {
    return tex(640, 300, (g, w, h) => {
      g.strokeStyle = color; g.fillStyle = color;
      g.lineWidth = 14; roundRect(g, 14, 14, w - 28, h - 28, 26); g.stroke();
      g.lineWidth = 4; roundRect(g, 34, 34, w - 68, h - 68, 16); g.stroke();
      g.textAlign = 'center';
      g.font = `800 112px ${SANS}`; g.fillText(word, w / 2, 160);
      g.font = `600 40px ${SANS}`; g.fillText(date, w / 2, 222);
      g.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 1400; i++) {
        g.globalAlpha = Math.random() * 0.8;
        g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * 3.2, 0, Math.PI * 2); g.fill();
      }
    });
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  const screenTex = tex(512, 1000, (g, w, h) => {
    g.fillStyle = '#F7F8FB'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2B44C9'; g.fillRect(0, 0, w, 190);
    g.fillStyle = '#fff'; g.font = `700 34px ${SANS}`; g.fillText('AP-202610-0042', 36, 96);
    g.font = `400 24px ${SANS}`; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText('Sunrise Mini Mart, October', 36, 140);
    const page = (x, y) => {
      g.fillStyle = '#fff'; g.shadowColor = 'rgba(22,32,58,0.18)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
      g.fillRect(x, y, 200, 260); g.shadowColor = 'transparent';
      g.fillStyle = '#D6DBE5';
      for (let i = 0; i < 9; i++) g.fillRect(x + 22, y + 30 + i * 24, 150 - (i % 3) * 30, 9);
    };
    page(36, 240); page(276, 240); page(36, 540);
    g.fillStyle = '#1D7247'; g.beginPath(); g.arc(300, 640, 34, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(284, 640); g.lineTo(296, 652); g.lineTo(318, 628); g.stroke();
    g.fillStyle = '#16203A'; g.font = `700 30px ${SANS}`; g.fillText('3 scans', 36, 880);
    g.fillStyle = '#4A5470'; g.font = `400 24px ${SANS}`; g.fillText('Attached to this batch', 36, 920);
  });

  const slipTex = tex(600, 760, (g, w, h) => {
    g.fillStyle = '#FDFDFB'; g.fillRect(0, 0, w, h);
    grain(g, w, h, 2500, 'rgba(0,0,0,0.03)', 'rgba(255,255,255,0.2)');
    g.fillStyle = '#16203A'; g.font = `700 38px ${SANS}`; g.fillText('Release', 44, 86);
    g.fillText('acknowledgement', 44, 130);
    g.fillStyle = '#2B44C9'; g.fillRect(44, 160, 80, 6);
    g.font = `28px ${TYPE}`; g.fillStyle = '#2A3150';
    ['Batch  AP-202610-0042', 'To     Ana Reyes', '       Client owner', 'How    Pickup', 'By     Mark, staff'].forEach((l, i) => g.fillText(l, 44, 236 + i * 52));
    g.strokeStyle = '#A9B1C2'; g.lineWidth = 2; g.beginPath(); g.moveTo(44, 640); g.lineTo(w - 44, 640); g.stroke();
    g.strokeStyle = '#1E33A0'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(70, 620);
    g.bezierCurveTo(110, 540, 140, 650, 180, 590); g.bezierCurveTo(210, 550, 230, 640, 280, 600); g.bezierCurveTo(320, 570, 360, 610, 420, 590);
    g.stroke();
    g.fillStyle = '#4A5470'; g.font = `22px ${SANS}`; g.fillText('Received by', 44, 680);
  });

  function labelTex(text) {
    return tex(256, 140, (g, w, h) => {
      g.fillStyle = '#FBF8EE'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#8D97AB'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
      g.fillStyle = '#1C2440'; g.font = `64px ${TYPE}`; g.textAlign = 'center'; g.fillText(text, w / 2, 94);
    });
  }

  /* --- Objects --- */
  const stage = new THREE.Group();
  scene.add(stage);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.13 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.75;
  ground.receiveShadow = true;
  stage.add(ground);

  // Soft contact shadow that follows the envelope
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.6), new THREE.MeshBasicMaterial({
    map: tex(256, 128, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(22,32,58,0.30)'); gr.addColorStop(1, 'rgba(22,32,58,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }), transparent: true, depthWrite: false
  }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = -1.74;
  stage.add(blob);

  // Envelope
  const envPivot = new THREE.Group();
  const env = new THREE.Group();
  envPivot.add(env);
  stage.add(envPivot);
  const manilaMat = new THREE.MeshStandardMaterial({ color: 0xc9a865, roughness: 0.92 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(3.2, 2.2, 0.08, 3, 0.035), manilaMat);
  env.add(body);
  const faceGeo = new THREE.PlaneGeometry(3.15, 2.15);
  const front = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.9 }));
  front.position.z = 0.041;
  env.add(front);
  const back = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.9 }));
  back.position.z = -0.041; back.rotation.y = Math.PI;
  env.add(back);

  function stampMesh(t, x, y, rot) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.7),
      new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.set(x, y, 0.045); m.rotation.z = rot; m.scale.setScalar(0.0001);
    env.add(m);
    return m;
  }
  const received = stampMesh(stampTex('RECEIVED', '20 OCT 2026', '#C4303A'), 0.72, 0.4, 0.2);
  const released = stampMesh(stampTex('RELEASED', '06 NOV 2026', '#2B44C9'), 0.62, -0.55, -0.14);

  // Scanner light
  const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 0.7), new THREE.MeshBasicMaterial({
    map: tex(16, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(110,140,255,0)'); gr.addColorStop(0.5, 'rgba(150,175,255,1)'); gr.addColorStop(1, 'rgba(110,140,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0
  }));
  scanGlow.position.z = 0.12;
  env.add(scanGlow);

  // Phone with the digital copy
  const phone = new THREE.Group();
  const phoneBody = new THREE.Mesh(new RoundedBoxGeometry(1.15, 2.22, 0.1, 4, 0.09), new THREE.MeshStandardMaterial({ color: 0x1b2236, roughness: 0.4, metalness: 0.3 }));
  phoneBody.castShadow = true;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.03, 2.02), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.position.z = 0.052;
  phone.add(phoneBody, screen);
  phone.visible = false;
  stage.add(phone);

  // Filing cabinet
  const cabinet = new THREE.Group();
  const CAB_Z = -1.7;
  const steel = new THREE.MeshStandardMaterial({ color: 0xaeb8ca, roughness: 0.5, metalness: 0.35 });
  const steelLight = new THREE.MeshStandardMaterial({ color: 0xc4ccda, roughness: 0.45, metalness: 0.3 });
  const cabBody = new THREE.Mesh(new RoundedBoxGeometry(2.5, 3.3, 1.8, 4, 0.06), steel);
  cabBody.position.y = -0.1; cabBody.castShadow = true; cabBody.receiveShadow = true;
  cabinet.add(cabBody);
  const drawers = [];
  [['B-1', 1.0], ['B-2', -0.06], ['B-3', -1.12]].forEach(([name, y]) => {
    const d = new THREE.Group();
    d.position.set(0, y, 0);
    const frontD = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.94, 0.1, 3, 0.03), steelLight);
    frontD.position.z = 0.95; frontD.castShadow = true;
    const handle = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.09, 0.1, 2, 0.04), steel);
    handle.position.set(0, -0.2, 1.04);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.25), new THREE.MeshStandardMaterial({ map: labelTex(name), roughness: 0.9 }));
    lbl.position.set(0, 0.18, 1.006);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x98a3b8, roughness: 0.6, metalness: 0.3 });
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 1.7), trayMat);
    bottom.position.set(0, -0.38, 0.05);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 1.7), trayMat); sideL.position.set(-1.05, -0.1, 0.05);
    const sideR = sideL.clone(); sideR.position.x = 1.05;
    const backW = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 0.04), trayMat); backW.position.set(0, -0.1, -0.8);
    d.add(frontD, handle, lbl, bottom, sideL, sideR, backW);
    cabinet.add(d);
    drawers.push(d);
  });
  cabinet.position.set(0, -6, CAB_Z);
  cabinet.visible = false;
  stage.add(cabinet);
  const drawer = drawers[1];

  // Release slip
  const slip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.9, 0.012), [
    null, null, null, null,
    new THREE.MeshStandardMaterial({ map: slipTex, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0xf4f4f0 })
  ].map(m => m || new THREE.MeshStandardMaterial({ color: 0xf4f4f0 })));
  slip.castShadow = true;
  slip.visible = false;
  stage.add(slip);

  /* --- Layout --- */
  let wide = true, halfH = 1, halfW = 1;
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(15)) * CAM_Z;
    halfW = halfH * camera.aspect;
    wide = w >= 860 && w / h > 1;
    if (wide) {
      stage.position.set(halfW * 0.42, -0.05, 0);
      stage.scale.setScalar(THREE.MathUtils.clamp(halfW / 4.9, 0.6, 1));
    } else {
      stage.position.set(0, halfH * 0.38, 0);
      stage.scale.setScalar(THREE.MathUtils.clamp((halfW * 1.75) / 3.6, 0.4, 0.8));
    }
  }
  addEventListener('resize', resize);
  resize();

  /* --- Interaction --- */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  // The envelope is no longer dragged; it only follows the pointer and the story scroll.
  const spin = 0;

  /* --- Scroll progress: 0 at hero, +1 per story step --- */
  const steps = [...document.querySelectorAll('.step')];
  const story = document.querySelector('.story');
  function targetProgress() {
    const line = innerHeight * 0.8;
    let t = 0;
    for (const s of steps) {
      const r = s.getBoundingClientRect();
      t += THREE.MathUtils.clamp((line - r.top) / r.height, 0, 1);
    }
    return t;
  }

  /* --- Animation helpers --- */
  const clamp = THREE.MathUtils.clamp;
  const lerp = THREE.MathUtils.lerp;
  const seg = (t, a, b) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const pop = x => { if (x <= 0) return 0.0001; if (x >= 1) return 1; const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const mix = (a, b, x) => ({ x: lerp(a.x, b.x, x), y: lerp(a.y, b.y, x), z: lerp(a.z, b.z, x), s: lerp(a.s, b.s, x) });

  const HOME = { x: 0, y: 0.15, z: 0, s: 1 };
  const DRAWER_OPEN = 1.35;
  const TRAY_Z = CAB_Z + 0.05;

  let t = 0;
  let last = performance.now();
  let visible = true;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const time = now / 1000;

    const target = targetProgress();
    t = reduceMotion ? target : t + (target - t) * Math.min(1, dt * 5);

    // Fade the scene out once the story has scrolled past
    const sr = story.getBoundingClientRect();
    const fadeIn = clamp((innerHeight * 0.85 - sr.top) / (innerHeight * 0.45), 0, 1);
    const fade = Math.min(fadeIn, clamp((sr.bottom - innerHeight * 0.3) / (innerHeight * 0.4), 0, 1));
    canvas.style.opacity = fade;
    visible = fade > 0.001;

    if (visible) {
      // Pointer tilt
      pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 4);
      pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 4);

      // Drawer: open to receive, close, reopen to return
      const dOpen = seg(t, 2.3, 2.5) - seg(t, 2.8, 2.97) + seg(t, 2.98, 3.15);
      drawer.position.z = dOpen * DRAWER_OPEN;

      // Cabinet rises in for filing, sinks away after return
      const cabIn = seg(t, 1.95, 2.35) * (1 - seg(t, 3.42, 3.72));
      cabinet.visible = cabIn > 0.001;
      ground.visible = cabinet.visible;
      cabinet.position.y = lerp(-6, 0, cabIn);

      // Envelope path
      const tray = { x: 0, y: 0.06, z: TRAY_Z + drawer.position.z, s: 0.4 };
      const above = { x: 0, y: 1.45, z: TRAY_Z + DRAWER_OPEN, s: 0.4 };
      let p;
      if (t < 3.05) p = mix(mix(HOME, above, seg(t, 2.4, 2.62)), tray, seg(t, 2.6, 2.8));
      else p = mix(mix(tray, above, seg(t, 3.1, 3.32)), HOME, seg(t, 3.3, 3.55));
      const inCab = seg(t, 2.38, 2.5) * (1 - seg(t, 3.35, 3.55));

      const float = reduceMotion ? 0 : Math.sin(time * 1.1) * 0.06 * (1 - inCab);
      envPivot.position.set(p.x, p.y + float, p.z);
      envPivot.scale.setScalar(p.s);
      blob.position.set(p.x, -1.74, p.z);
      blob.scale.setScalar(p.s * (1 - float * 0.6));
      blob.material.opacity = 1 - inCab;
      const tilt = 1 - inCab;
      envPivot.rotation.set(
        (pointer.sy * 0.16 + (reduceMotion ? 0 : Math.sin(time * 0.7) * 0.03)) * tilt,
        (-0.32 + pointer.sx * 0.28) * tilt + spin,
        (reduceMotion ? 0 : Math.sin(time * 0.5) * 0.015) * tilt
      );

      // Stamps
      received.scale.setScalar(pop(seg(t, 0.35, 0.62)));
      released.scale.setScalar(pop(seg(t, 3.55, 3.72)));

      // Scanner sweep
      const scanOn = seg(t, 1.0, 1.08) * (1 - seg(t, 1.55, 1.65));
      scanGlow.material.opacity = scanOn;
      scanGlow.position.y = lerp(1.25, -1.25, seg(t, 1.05, 1.58));

      // Phone shows the scans, leaves before filing
      const phoneIn = seg(t, 1.3, 1.7) * (1 - seg(t, 1.95, 2.25));
      phone.visible = phoneIn > 0.001;
      phone.position.set(lerp(2.6, wide ? 1.55 : 0.8, phoneIn), lerp(-2.4, wide ? -0.55 : -0.7, phoneIn), wide ? 1.0 : 1.3);
      phone.rotation.set(-0.08, lerp(-0.9, -0.42, phoneIn), lerp(-0.4, 0.06, phoneIn));

      // Release slip slides out from under the envelope
      const slipIn = seg(t, 3.6, 3.85);
      slip.visible = slipIn > 0.001;
      slip.position.set(lerp(-0.2, wide ? -1.35 : -0.85, slipIn), lerp(-2.6, -0.45, slipIn), lerp(-0.3, 0.45, slipIn));
      slip.rotation.set(-0.05, 0.25, lerp(-0.3, 0.07, slipIn));

      // Camera pulls back while the cabinet is on stage
      const pull = seg(t, 1.9, 2.3) * (1 - seg(t, 3.4, 3.75));
      camera.position.set(0, 0.55 + pull * 0.7, CAM_Z + pull * 2.1);
      camera.lookAt(0, pull * 0.05, 0);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
