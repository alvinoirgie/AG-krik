/**
 * KINETIC VOID — INTERACTIVE LOGIC & CYBERNETIC VISUAL ENGINES
 * Project: 1464120612697715765 — Futuristic Developer Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initHolographicHero();
  initProjectCanvasVisuals();
  initTerminal();
  initAudioSynthesizer();
  initNavigation();
  initProjectModal();
  initTransmissionForm();
  initTelemetryClock();
});

/* ==========================================================================
   1. WEB AUDIO SYNTHESIZER (Pure Web Audio API — No External Audio Needed)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioSynthesizer() {
  const audioBtn = document.getElementById('audio-toggle');
  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    soundEnabled = !soundEnabled;
    audioBtn.classList.toggle('active', soundEnabled);
    audioBtn.innerHTML = soundEnabled 
      ? `<span>🔊</span> AUDIO: ON` 
      : `<span>🔇</span> AUDIO: OFF`;

    if (soundEnabled) {
      playTone(587.33, 'sine', 0.1, 0.05); // High D chirp
      setTimeout(() => playTone(880, 'sine', 0.15, 0.05), 80); // High A
    }
  });

  // Attach subtle audio feedback to interactive buttons
  document.querySelectorAll('button, .nav-link, .btn-primary, .btn-secondary, .channel-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playTone(700, 'triangle', 0.03, 0.015);
    });
    el.addEventListener('click', () => {
      if (soundEnabled) playTone(440, 'sine', 0.08, 0.04);
    });
  });
}

function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.05) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio synthesis issue:', e);
  }
}

/* ==========================================================================
   2. AMBIENT BACKGROUND PARTICLE & MESH CANVAS
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const particles = [];
  const PARTICLE_COUNT = 55;
  const mouse = { x: -1000, y: -1000, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.8 + 0.8;
      this.baseAlpha = Math.random() * 0.45 + 0.15;
      this.color = Math.random() > 0.4 ? 'rgba(56, 189, 248,' : 'rgba(168, 85, 247,';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 2.5;
        this.y -= (dy / dist) * force * 2.5;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${this.baseAlpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color === 'rgba(56, 189, 248,' ? '#38bdf8' : '#a855f7';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines between particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(render);
  }
  render();
}

/* ==========================================================================
   3. HOLOGRAPHIC HERO 3D PARTICLE CORE SIMULATION
   ========================================================================== */
function initHolographicHero() {
  const canvas = document.getElementById('holo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  function resize() {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let angleX = 0;
  let angleY = 0;
  let rotSpeedX = 0.005;
  let rotSpeedY = 0.008;

  // Interactivity with mouse over canvas
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    rotSpeedY = mx * 0.04;
    rotSpeedX = -my * 0.04;
  });

  // Generate 3D points on a sphere and orbital rings
  const sphereNodes = [];
  const SPHERE_POINTS = 160;
  const radius = Math.min(width, height) * 0.32 || 95;

  for (let i = 0; i < SPHERE_POINTS; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    sphereNodes.push({
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
      type: 'sphere'
    });
  }

  // Add planar orbital ring
  const RING_POINTS = 90;
  const ringRadius = radius * 1.45;
  for (let i = 0; i < RING_POINTS; i++) {
    const angle = (i / RING_POINTS) * Math.PI * 2;
    sphereNodes.push({
      x: ringRadius * Math.cos(angle),
      y: (Math.random() - 0.5) * 8,
      z: ringRadius * Math.sin(angle),
      type: 'ring'
    });
  }

  const fpsElem = document.getElementById('holo-fps');
  let lastTime = performance.now();
  let frameCount = 0;

  function renderHero3D(now) {
    ctx.clearRect(0, 0, width, height);

    // Calculate FPS
    frameCount++;
    if (now - lastTime >= 1000) {
      if (fpsElem) fpsElem.textContent = `${frameCount} FPS`;
      frameCount = 0;
      lastTime = now;
    }

    angleX += rotSpeedX;
    angleY += rotSpeedY;

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    const projected = [];
    const cx = width / 2;
    const cy = height / 2;
    const fov = 340;

    for (let i = 0; i < sphereNodes.length; i++) {
      const p = sphereNodes[i];

      // Rotate Y
      const x1 = p.x * cosY + p.z * sinY;
      const y1 = p.y;
      const z1 = -p.x * sinY + p.z * cosY;

      // Rotate X
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const depth = z2 + 280;
      if (depth > 0) {
        const scale = fov / depth;
        const px = cx + x2 * scale;
        const py = cy + y2 * scale;
        projected.push({
          x: px,
          y: py,
          z: z2,
          scale: scale,
          type: p.type
        });
      }
    }

    // Sort by depth for correct z-buffering
    projected.sort((a, b) => a.z - b.z);

    // Draw central reactor core glow
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 60);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
    grad.addColorStop(1, 'rgba(10, 10, 15, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();

    // Draw nodes
    for (let i = 0; i < projected.length; i++) {
      const pt = projected[i];
      const alpha = Math.max(0.15, Math.min(1, (pt.z + radius) / (2 * radius)));

      ctx.beginPath();
      const dotSize = pt.type === 'ring' ? 1.5 * pt.scale : 2.2 * pt.scale;
      ctx.arc(pt.x, pt.y, Math.max(0.8, dotSize), 0, Math.PI * 2);

      if (pt.type === 'ring') {
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.9})`;
      } else {
        ctx.fillStyle = alpha > 0.6 
          ? `rgba(56, 189, 248, ${alpha})` 
          : `rgba(168, 85, 247, ${alpha * 0.7})`;
      }
      ctx.fill();
    }

    requestAnimationFrame(renderHero3D);
  }
  requestAnimationFrame(renderHero3D);
}

/* ==========================================================================
   4. GENERATIVE LIVE CANVASES FOR PROJECT CARDS
   ========================================================================== */
function initProjectCanvasVisuals() {
  // Project 1: Hyperion Stream Mesh
  const c1 = document.getElementById('canvas-proj-1');
  if (c1) {
    const ctx = c1.getContext('2d');
    let t = 0;
    function renderHyperion() {
      const w = c1.width = c1.parentElement.clientWidth;
      const h = c1.height = 240;
      ctx.fillStyle = '#09090f';
      ctx.fillRect(0, 0, w, h);

      // Streaming data pulses
      t += 0.035;
      const lanes = 6;
      for (let i = 0; i < lanes; i++) {
        const y = (h / (lanes + 1)) * (i + 1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        // Pulsing packets
        for (let j = 0; j < 3; j++) {
          const packetX = ((t * 70 + j * (w / 3) + i * 45) % (w + 40)) - 20;
          ctx.beginPath();
          ctx.arc(packetX, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#a855f7';
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Packet trail
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(168, 85, 247, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(packetX, y);
          ctx.lineTo(packetX - 35, y);
          ctx.stroke();
        }
      }
      requestAnimationFrame(renderHyperion);
    }
    renderHyperion();
  }

  // Project 2: NeuralCanvas Shader Waves
  const c2 = document.getElementById('canvas-proj-2');
  if (c2) {
    const ctx = c2.getContext('2d');
    let t = 0;
    function renderNeural() {
      const w = c2.width = c2.parentElement.clientWidth;
      const h = c2.height = 240;
      ctx.fillStyle = '#09090f';
      ctx.fillRect(0, 0, w, h);

      t += 0.02;
      const waveCount = 4;
      for (let k = 0; k < waveCount; k++) {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 5) {
          const freq = 0.015 + k * 0.005;
          const amp = 35 + k * 12;
          const y = h / 2 + Math.sin(x * freq + t * (k + 1)) * amp * Math.cos(t * 0.5 + x * 0.005);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = k % 2 === 0 ? 'rgba(6, 182, 212, 0.65)' : 'rgba(168, 85, 247, 0.65)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(renderNeural);
    }
    renderNeural();
  }

  // Project 3: Nexus Agent Graph
  const c3 = document.getElementById('canvas-proj-3');
  if (c3) {
    const ctx = c3.getContext('2d');
    const nodes = [
      { x: 0.25, y: 0.3, label: 'AGENT-01' },
      { x: 0.5, y: 0.2, label: 'COORDINATOR' },
      { x: 0.75, y: 0.35, label: 'VECTOR-MEM' },
      { x: 0.35, y: 0.7, label: 'CRITIC' },
      { x: 0.65, y: 0.75, label: 'TOOL-EXEC' }
    ];
    let step = 0;
    function renderNexus() {
      const w = c3.width = c3.parentElement.clientWidth;
      const h = c3.height = 240;
      ctx.fillStyle = '#09090f';
      ctx.fillRect(0, 0, w, h);
      step += 0.025;

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const x1 = nodes[i].x * w;
          const y1 = nodes[i].y * h;
          const x2 = nodes[j].x * w;
          const y2 = nodes[j].y * h;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Traveling packets along edges
          const progress = (step + (i * 0.3 + j * 0.5)) % 1;
          const px = x1 + (x2 - x1) * progress;
          const py = y1 + (y2 - y1) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#10b981';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw agent nodes
      nodes.forEach((n, idx) => {
        const nx = n.x * w;
        const ny = n.y * h;
        ctx.beginPath();
        ctx.arc(nx, ny, 8, 0, Math.PI * 2);
        ctx.fillStyle = idx === 1 ? '#38bdf8' : '#12111a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(renderNexus);
    }
    renderNexus();
  }

  // Project 4: QuantumGate Shield
  const c4 = document.getElementById('canvas-proj-4');
  if (c4) {
    const ctx = c4.getContext('2d');
    let qAngle = 0;
    function renderQuantum() {
      const w = c4.width = c4.parentElement.clientWidth;
      const h = c4.height = 240;
      ctx.fillStyle = '#09090f';
      ctx.fillRect(0, 0, w, h);
      qAngle += 0.02;

      const cx = w / 2;
      const cy = h / 2;

      // Rotating concentric quantum rings
      for (let r = 1; r <= 3; r++) {
        const radius = r * 30;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.45, qAngle * (r % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
        ctx.strokeStyle = r === 2 ? '#a855f7' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Central cryptographic glyph
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#06b6d4';
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(renderQuantum);
    }
    renderQuantum();
  }
}

/* ==========================================================================
   5. FUNCTIONAL CYBERNETIC TERMINAL SIMULATOR
   ========================================================================== */
function initTerminal() {
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');
  const quickChips = document.querySelectorAll('.chip-btn');
  const quickLaunchBtn = document.getElementById('quick-terminal-btn');

  if (!termInput || !termOutput) return;

  const commandHistory = [];
  let historyIndex = -1;

  if (quickLaunchBtn) {
    quickLaunchBtn.addEventListener('click', () => {
      const termSection = document.getElementById('terminal');
      if (termSection) {
        termSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => termInput.focus(), 600);
      }
    });
  }

  // Keyboard shortcut Ctrl+T / Cmd+T to focus terminal
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const termSection = document.getElementById('terminal');
      if (termSection) {
        termSection.scrollIntoView({ behavior: 'smooth' });
        termInput.focus();
      }
    }
  });

  const commands = {
    help: () => `
Available system routines:
  <span style="color:var(--accent-blue)">help</span>       - Displays this diagnostic command index
  <span style="color:var(--accent-blue)">about</span>      - Developer biography & system philosophy
  <span style="color:var(--accent-blue)">projects</span>   - Query active deployments & repositories
  <span style="color:var(--accent-blue)">skills</span>     - Telemetry rating of engineering capabilities
  <span style="color:var(--accent-blue)">neofetch</span>   - Print system host & developer environment
  <span style="color:var(--accent-blue)">matrix</span>     - Initialize streaming green cyber matrix stream
  <span style="color:var(--accent-blue)">contact</span>    - Transmission channels & cryptographic keys
  <span style="color:var(--accent-blue)">ping</span>       - Ping remote edge node for latency measurement
  <span style="color:var(--accent-blue)">clear</span>      - Clear terminal telemetry buffer
`,
    about: () => `
<strong style="color:var(--accent-blue)">DEVELOPER IDENTITY:</strong> Irgie Alvino
<strong style="color:var(--accent-violet)">INSTITUTION:</strong> SMKN 2 Surakarta (Rekayasa Perangkat Lunak)
<strong style="color:var(--accent-cyan)">ROLE:</strong> Programmer & Fullstack Web Developer
<strong style="color:var(--text-primary)">LOCATION:</strong> Surakarta, Jawa Tengah, Indonesia
<strong style="color:var(--accent-blue)">MISSION:</strong> Membangun website modern responsif, arsitektur backend yang efisien,
         dan antarmuka web interaktif masa depan dengan performa optimal.
`,
    projects: () => `
<div style="display:flex;flex-direction:column;gap:6px;">
  <div>[01] <strong style="color:var(--accent-blue)">Hyperion Web Engine</strong> - Realtime stream & socket application</div>
  <div>[02] <strong style="color:var(--accent-cyan)">NeuralCanvas Studio</strong> - Interactive canvas shader & spatial graphics</div>
  <div>[03] <strong style="color:var(--accent-violet)">Nexus Agent Grid</strong> - Intelligent automated workflow & assistant</div>
  <div>[04] <strong style="color:#10b981">QuantumGate Security</strong> - Authentication & school management portal</div>
</div>
Ketik 'help' atau klik kartu proyek di atas untuk melihat detail arsitektur.
`,
    skills: () => `
FRONTEND & UI:     HTML5/CSS3 [96%] | JavaScript/TypeScript [92%] | React [88%] | Canvas UI [95%]
BACKEND & SERVER:   Node.js [92%] | PHP/Laravel [88%] | RESTful API [94%] | Python [85%]
DATABASE & TOOLS:  MySQL [92%] | MongoDB [86%] | Git/GitHub [95%] | Linux CLI [90%]
`,
    neofetch: () => `
<span style="color:var(--accent-cyan)">
       .---.          <strong style="color:var(--text-primary)">irgie@smkn2-solo</strong>
      /     \\         ------------------
     | () () |        <span style="color:var(--accent-blue)">OS:</span> Linux / DevStation Solo
      \\  _  /         <span style="color:var(--accent-blue)">Sekolah:</span> SMK Negeri 2 Surakarta
       \`---\`          <span style="color:var(--accent-blue)">Jurusan:</span> Rekayasa Perangkat Lunak (RPL)
                      <span style="color:var(--accent-blue)">Shell:</span> zsh / bash
                      <span style="color:var(--accent-blue)">Terminal:</span> IrgieWebTerm
                      <span style="color:var(--accent-blue)">Primary Stack:</span> JavaScript, TypeScript, Node.js, PHP, MySQL
                      <span style="color:var(--accent-blue)">Status:</span> Open for Projects & Internship
</span>
`,
    contact: () => `
<span style="color:var(--accent-blue)">JALUR KOMUNIKASI RESMI:</span>
  Email:    <a href="mailto:alvinoirgie@gmail.com" style="color:var(--accent-cyan)">alvinoirgie@gmail.com</a>
  GitHub:   <a href="https://github.com/alvinoirgie" target="_blank" style="color:var(--accent-cyan)">github.com/alvinoirgie</a>
  Sekolah:  SMKN 2 Surakarta (Jawa Tengah, Indonesia)
  Bidang:   Programmer & Fullstack Web Developer
`,
    ping: () => `
PING kineticvoid.edge.network (172.64.38.12): 56 data bytes
64 bytes from 172.64.38.12: icmp_seq=1 ttl=58 time=12.4 ms
64 bytes from 172.64.38.12: icmp_seq=2 ttl=58 time=11.9 ms
64 bytes from 172.64.38.12: icmp_seq=3 ttl=58 time=13.1 ms
--- 172.64.38.12 ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max = 11.9/12.4/13.1 ms
`,
    matrix: () => {
      let output = '';
      const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈ';
      for (let i = 0; i < 4; i++) {
        let line = '';
        for (let j = 0; j < 48; j++) {
          line += chars[Math.floor(Math.random() * chars.length)];
        }
        output += `<div style="color:#10b981;font-size:0.75rem;letter-spacing:2px;">${line}</div>`;
      }
      return output + `<div style="color:var(--accent-cyan);margin-top:4px;">[MATRIX CIPHER STREAM ESTABLISHED]</div>`;
    },
    clear: () => {
      termOutput.innerHTML = '';
      return null;
    }
  };

  function executeCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    commandHistory.push(cmd);
    historyIndex = commandHistory.length;

    // Echo input
    const entry = document.createElement('div');
    entry.className = 'term-entry';

    const cmdLine = document.createElement('div');
    cmdLine.className = 'term-command-line';
    cmdLine.innerHTML = `<span class="term-prompt">irgie@smkn2-solo:~$</span> <span>${escapeHtml(raw)}</span>`;
    entry.appendChild(cmdLine);

    if (commands[cmd]) {
      const res = commands[cmd]();
      if (res !== null) {
        const resDiv = document.createElement('div');
        resDiv.className = 'term-response';
        resDiv.innerHTML = res;
        entry.appendChild(resDiv);
        termOutput.appendChild(entry);
      }
    } else {
      const errDiv = document.createElement('div');
      errDiv.className = 'term-response';
      errDiv.innerHTML = `<span style="color:var(--accent-rose)">Command not recognized: '${escapeHtml(cmd)}'.</span> Type <strong style="color:var(--accent-blue)">'help'</strong> to view valid routines.`;
      entry.appendChild(errDiv);
      termOutput.appendChild(entry);
    }

    termInput.value = '';
    const body = termInput.closest('.terminal-body');
    if (body) body.scrollTop = body.scrollHeight;

    if (soundEnabled) playTone(520, 'sine', 0.05, 0.03);
  }

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCommand(termInput.value);
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        termInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        termInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        termInput.value = '';
      }
    }
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ==========================================================================
   6. NAVIGATION & SMOOTH FILTERING
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // Filter tabs for Projects
  const filterBtns = document.querySelectorAll('.tab-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. PROJECT DEEP-DIVE ARCHITECTURAL MODAL
   ========================================================================== */
const projectDetails = {
  proj1: {
    title: 'Hyperion Engine — Distributed Event Mesh',
    category: 'SYSTEMS // CLOUD ARCHITECTURE',
    desc: 'High-throughput, zero-copy distributed telemetry and streaming broker written in Rust with eBPF network acceleration.',
    specs: [
      { label: 'Throughput', val: '1.2M events/sec per node' },
      { label: 'p99 Latency', val: '0.42 ms' },
      { label: 'Memory Footprint', val: '24 MB base footprint' },
      { label: 'Consensus', val: 'Raft-based quorum with multi-tenant partition isolation' }
    ],
    deepDive: `
      Hyperion was architected to eliminate the JVM memory overhead and GC pauses traditionally found in enterprise message buses. By utilizing Rust's zero-cost abstractions, direct epoll/io_uring system calls, and eBPF bypass filters in the Linux kernel, it achieves wire-speed packet ingestion directly into ring buffers.
    `,
    tech: ['Rust', 'eBPF', 'io_uring', 'gRPC', 'WebAssembly', 'Prometheus']
  },
  proj2: {
    title: 'NeuralCanvas Studio — WebGPU Shader Suite',
    category: 'SPATIAL // GRAPHICS COMPUTING',
    desc: 'Next-generation browser-based spatial computing studio featuring hardware-accelerated GLSL shader synthesis and real-time raymarching.',
    specs: [
      { label: 'Rendering API', val: 'WebGPU Compute & Render Pipelines' },
      { label: 'Framerate', val: 'Locked 120 FPS at 4K resolution' },
      { label: 'Compile Time', val: 'Real-time JIT shader compile (<15ms)' },
      { label: 'Format Support', val: 'WGSL, GLSL, glTF 2.0 with PBR materials' }
    ],
    deepDive: `
      Leveraging the bleeding edge of WebGPU, NeuralCanvas unlocks direct compute shader invocation within Chrome and Safari without plugins. It provides real-time mathematical fractal exploration, volumetric light propagation, and audio-reactive physics simulations running concurrently across thousands of GPU threads.
    `,
    tech: ['TypeScript', 'WebGPU', 'WGSL', 'Three.js Core', 'WebAssembly', 'Canvas API']
  },
  proj3: {
    title: 'Nexus Autonomous Agent Grid',
    category: 'AI // AGENTIC INFRASTRUCTURE',
    desc: 'Decentralized multi-agent coordination mesh enabling autonomous problem decomposition, state synchronization, and verifiable audit trails.',
    specs: [
      { label: 'Agent Density', val: '10,000+ concurrently active workers' },
      { label: 'Context Engine', val: 'Gemini 3.8 Flash with 1M token memory' },
      { label: 'Vector Index', val: 'HNSW graph with sub-10ms retrieval' },
      { label: 'Audit Trail', val: 'Cryptographic hash-chain verification' }
    ],
    deepDive: `
      Nexus treats AI agents as microservices with isolated state channels. When an objective is submitted, a master coordinator breaks down tasks into dependency DAGs, dispatches them across specialized workers (critic, researcher, synthesizer), and verifies outputs through deterministic consensus before committing to permanent storage.
    `,
    tech: ['Python', 'Go', 'Gemini 3.8 Flash', 'VectorDB', 'Redis', 'OpenTelemetry']
  },
  proj4: {
    title: 'QuantumGate Shield — Zero-Trust Gateway',
    category: 'SECURITY // MICROSERVICE PROXY',
    desc: 'High-performance cryptographic edge proxy designed for microsecond-level identity validation and mutual TLS mesh routing.',
    specs: [
      { label: 'Encryption', val: 'ChaCha20-Poly1305 + Post-Quantum Kyber768' },
      { label: 'Proxy Overhead', val: '< 0.18 ms added roundtrip' },
      { label: 'Compliance', val: 'FIPS 140-3 and Zero-Trust NIST SP 800-207' },
      { label: 'Deployment', val: 'Kubernetes DaemonSet & Envoy filter' }
    ],
    deepDive: `
      QuantumGate operates as an ultra-lightweight sidecar and ingress controller. It enforces identity-bound access tokens per RPC, automatically rotates ephemeral wireguard tunnels, and incorporates experimental post-quantum key encapsulation algorithms to safeguard sensitive communication against future decrypt-later attacks.
    `,
    tech: ['Go', 'WireGuard', 'Kyber-768', 'Envoy Proxy', 'Kubernetes', 'OAuth3']
  }
};

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('btn-modal-close');
  if (!modal || !closeBtn) return;

  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-project');
      const data = projectDetails[id];
      if (!data) return;

      document.getElementById('modal-title').textContent = data.title;
      document.getElementById('modal-category').textContent = data.category;
      document.getElementById('modal-desc').textContent = data.desc;
      document.getElementById('modal-deepdive').textContent = data.deepDive;

      // Populate specs table
      const specsList = document.getElementById('modal-specs');
      specsList.innerHTML = '';
      data.specs.forEach(s => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.padding = '0.35rem 0';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        div.innerHTML = `<span style="color:var(--text-dim);font-family:var(--font-code);font-size:0.8rem">${s.label}</span>
                         <span style="color:var(--accent-blue);font-family:var(--font-code);font-weight:600;font-size:0.85rem">${s.val}</span>`;
        specsList.appendChild(div);
      });

      // Populate tech tags
      const techList = document.getElementById('modal-tags');
      techList.innerHTML = '';
      data.tech.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tech-tag';
        span.textContent = t;
        techList.appendChild(span);
      });

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (soundEnabled) playTone(650, 'sine', 0.1, 0.04);
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ==========================================================================
   8. TRANSMISSION FORM (CYBERNETIC ENCRYPTION SEQUENCE)
   ========================================================================== */
function initTransmissionForm() {
  const form = document.getElementById('transmission-form');
  const statusBox = document.getElementById('transmission-status');
  const submitBtn = document.getElementById('submit-transmission-btn');

  if (!form || !statusBox || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⚡</span> ENCRYPTING TRANSMISSION...`;

    if (soundEnabled) {
      playTone(400, 'square', 0.1, 0.03);
      setTimeout(() => playTone(600, 'square', 0.1, 0.03), 150);
      setTimeout(() => playTone(800, 'square', 0.1, 0.03), 300);
    }

    setTimeout(() => {
      submitBtn.innerHTML = `<span>📡</span> TRANSMITTING VIA QUANTUM RELAY...`;
    }, 700);

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      statusBox.className = 'transmission-status success';
      statusBox.innerHTML = `<span>✔</span> <strong>TRANSMISSION ACKNOWLEDGED (200 OK):</strong> Pesan terenkripsi telah diterima oleh Irgie Alvino (SMKN 2 Surakarta). Tanggapan akan segera dikirimkan.`;
      statusBox.style.display = 'flex';
      form.reset();

      if (soundEnabled) {
        playTone(523.25, 'sine', 0.15, 0.05); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.15, 0.05), 100); // E5
        setTimeout(() => playTone(783.99, 'sine', 0.25, 0.05), 200); // G5
      }
    }, 1500);
  });
}

/* ==========================================================================
   9. REAL-TIME TELEMETRY CLOCK & NETWORK JITTER SIMULATOR
   ========================================================================== */
function initTelemetryClock() {
  const clockElem = document.getElementById('telemetry-clock');
  const pingElem = document.getElementById('telemetry-ping');

  function update() {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSecs = String(now.getUTCSeconds()).padStart(2, '0');
    if (clockElem) {
      clockElem.textContent = `UTC ${utcHours}:${utcMins}:${utcSecs}`;
    }

    // Micro latency fluctuation simulation
    if (pingElem && Math.random() > 0.65) {
      const ping = Math.floor(Math.random() * 5) + 12; // 12-16ms
      pingElem.textContent = `${ping}MS`;
    }
  }

  setInterval(update, 1000);
  update();
}
