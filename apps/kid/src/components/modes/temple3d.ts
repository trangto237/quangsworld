import * as THREE from 'three';

/**
 * Temple Run in 3D (Three.js): the camera runs behind the hero along a stone path through the jungle.
 * Each question is a fork: the path ends in a crossing with a way to the left and a way to the right, a
 * stone sign over each with an answer, and a drop straight ahead. Turning swings the whole view round
 * the corner like the real game; the wrong way crumbles under the hero, and running straight on falls
 * off the edge. All shapes are built here (no downloaded models), low-poly and light enough for phones.
 */

export type Side = 'left' | 'right';

const SPEED = 9; // units per second while waiting at the fork
const RUSH = 22; // once he has chosen, run quickly to the corner
const TILE = 2;
const WIDTH = 4.2;
const STUB = 11; // length of each way at a fork
const UP = new THREE.Vector3(0, 1, 0);

const fwd = (a: number) => new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
const LEFT = Math.PI / 2;

interface Fork {
  group: THREE.Group;
  start: THREE.Vector3;
  heading: number;
  length: number;
  /** Tiles of each way, so the wrong one can crumble. */
  stubs: Record<Side, THREE.Object3D[]>;
  signs: Record<Side, THREE.Mesh>;
  coins: THREE.Mesh[];
}

/** An answer on a stone sign: arrow and wrapped text, drawn on a canvas. */
function signTexture(text: string, side: Side) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#6b4f2a';
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#3f2c15';
  g.lineWidth = 16;
  g.strokeRect(8, 8, 496, 240);
  g.fillStyle = '#fde68a';
  g.font = 'bold 54px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText(side === 'left' ? '⬅' : '➡', 256, 66);
  // Wrap the answer onto up to three lines, shrinking the font to fit. [x] marks an underlined part
  // (pronunciation questions): drawn in yellow and underlined, like on the cards.
  const plain = (w: string) => w.replace(/[[\]]/g, '');
  for (let size = 46; size >= 20; size -= 4) {
    g.font = `bold ${size}px system-ui, sans-serif`;
    const lines: string[][] = [];
    let line: string[] = [];
    for (const w of text.split(/\s+/)) {
      const t = [...line, w];
      if (g.measureText(plain(t.join(' '))).width > 460 && line.length) {
        lines.push(line);
        line = [w];
      } else line = t;
    }
    if (line.length) lines.push(line);
    if (lines.length > 3 || !lines.every((l) => g.measureText(plain(l.join(' '))).width <= 470)) continue;
    const top = 128 - ((lines.length - 1) * size * 1.1) / 2 + size / 3 + 20;
    lines.forEach((l, i) => {
      const y = top + i * size * 1.1;
      let x = 256 - g.measureText(plain(l.join(' '))).width / 2;
      g.textAlign = 'left';
      for (const part of l.join(' ').split(/(\[[^\]]+\])/)) {
        if (!part) continue;
        const mark = part.startsWith('[');
        const t = mark ? part.slice(1, -1) : part;
        const w = g.measureText(t).width;
        g.fillStyle = mark ? '#fde047' : '#fff7ed';
        g.fillText(t, x, y);
        if (mark) g.fillRect(x, y + 6, w, 5);
        x += w;
      }
    });
    break;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export class TempleWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(62, 1, 0.1, 200);
  private hero = new THREE.Group();
  private legs: THREE.Object3D[] = [];
  private arms: THREE.Object3D[] = [];
  private forks: Fork[] = [];
  private fork: Fork | null = null;
  private s = 0; // distance along the current fork's straight path
  private heading = 0; // where he is running
  private look = 0; // where the camera looks (eases toward heading)
  private pos = new THREE.Vector3();
  private chosen: Side | null = null;
  private state: 'run' | 'wait' | 'turn' | 'fall' | 'paused' = 'paused';
  private fallV = 0;
  private turnFrom = new THREE.Vector3();
  private turnT = 0;
  private turnTo = 0;
  private crumbling: { o: THREE.Object3D; v: number; r: number }[] = [];
  private raf = 0;
  private last = 0;
  private ro: ResizeObserver;
  private mats: Record<string, THREE.Material>;
  private geos: Record<string, THREE.BufferGeometry>;
  private time = 0;

  /** Reached the fork (with what he chose, or null). */
  onFork: (side: Side | null) => void = () => {};
  onCoin: () => void = () => {};

  constructor(private host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    const sky = new THREE.Color('#9cc9b4');
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(sky, 18, 85);
    this.scene.add(new THREE.HemisphereLight('#fff7e0', '#2f4a2a', 1.6));
    const sun = new THREE.DirectionalLight('#ffe9b0', 1.4);
    sun.position.set(-20, 40, 10);
    this.scene.add(sun);
    // The drop below the paths.
    const abyss = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: '#16231b' }));
    abyss.rotation.x = -Math.PI / 2;
    abyss.position.y = -26;
    this.scene.add(abyss);

    this.mats = {
      stone: new THREE.MeshLambertMaterial({ color: '#b8ad9c' }),
      stone2: new THREE.MeshLambertMaterial({ color: '#a39783' }),
      edge: new THREE.MeshLambertMaterial({ color: '#7d715f' }),
      moss: new THREE.MeshLambertMaterial({ color: '#5e7d3a' }),
      leaf: new THREE.MeshLambertMaterial({ color: '#2f6b33' }),
      leaf2: new THREE.MeshLambertMaterial({ color: '#3f8a3a' }),
      trunk: new THREE.MeshLambertMaterial({ color: '#6b4a2b' }),
      pillar: new THREE.MeshLambertMaterial({ color: '#c9b48a' }),
      coin: new THREE.MeshLambertMaterial({ color: '#facc15', emissive: '#7a5a00' }),
      post: new THREE.MeshLambertMaterial({ color: '#5a3d1e' }),
      metal: new THREE.MeshLambertMaterial({ color: '#cbd5e1' }),
      skin: new THREE.MeshLambertMaterial({ color: '#f4c79a' }),
      cape: new THREE.MeshLambertMaterial({ color: '#dc2626', side: THREE.DoubleSide }),
      dark: new THREE.MeshLambertMaterial({ color: '#475569' }),
    };
    this.geos = {
      tile: new THREE.BoxGeometry(WIDTH, 0.6, TILE * 0.96),
      edge: new THREE.BoxGeometry(0.45, 0.7, TILE),
      trunk: new THREE.CylinderGeometry(0.25, 0.35, 3, 6),
      crown: new THREE.ConeGeometry(1.6, 3.6, 7),
      bush: new THREE.IcosahedronGeometry(1.2, 0),
      pillar: new THREE.BoxGeometry(0.9, 4.5, 0.9),
      cap: new THREE.BoxGeometry(1.3, 0.4, 1.3),
      coin: new THREE.TorusGeometry(0.32, 0.1, 6, 14),
      post: new THREE.BoxGeometry(0.22, 3.4, 0.22),
    };
    this.buildHero();
    this.scene.add(this.hero);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private buildHero() {
    const m = this.mats;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.45), m.metal);
    body.position.y = 1.45;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 10), m.skin);
    head.position.y = 2.15;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), m.metal);
    helmet.position.y = 2.2;
    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.5), m.cape);
    plume.position.set(0, 2.62, 0.05);
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), m.cape);
    cape.position.set(0, 1.35, 0.26);
    cape.rotation.x = 0.25;
    this.hero.add(body, head, helmet, plume, cape);
    for (const x of [-0.2, 0.2]) {
      const hip = new THREE.Group();
      hip.position.set(x, 1.0, 0);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.28), m.dark);
      leg.position.y = -0.47;
      hip.add(leg);
      this.legs.push(hip);
      this.hero.add(hip);
      const sh = new THREE.Group();
      sh.position.set(x * 2.3, 1.85, 0);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.22), m.metal);
      arm.position.y = -0.37;
      sh.add(arm);
      this.arms.push(sh);
      this.hero.add(sh);
    }
  }

  private resize() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Narrow (portrait) screens see a wider angle so the signs stay in view.
    this.camera.fov = w / h < 0.8 ? 72 : 60;
    this.camera.updateProjectionMatrix();
  }

  /** Jungle and temple pieces along both sides of a stretch of path. */
  private scenery(g: THREE.Group, from: THREE.Vector3, dir: THREE.Vector3, len: number, seed: number) {
    const side = new THREE.Vector3().crossVectors(dir, UP).normalize();
    let r = seed;
    const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let d = 3; d < len; d += 3.2) {
      for (const sgn of [-1, 1]) {
        const p = from.clone().addScaledVector(dir, d + rand() * 2).addScaledVector(side, sgn * (WIDTH / 2 + 2.5 + rand() * 5));
        const kind = rand();
        if (kind < 0.12) {
          const pillar = new THREE.Mesh(this.geos.pillar, this.mats.pillar);
          pillar.position.copy(p).setY(1.6 - rand() * 2);
          const cap = new THREE.Mesh(this.geos.cap, this.mats.pillar);
          cap.position.copy(pillar.position).setY(pillar.position.y + 2.4);
          g.add(pillar, cap);
        } else if (kind < 0.7) {
          const trunk = new THREE.Mesh(this.geos.trunk, this.mats.trunk);
          trunk.position.copy(p).setY(-0.5 + rand());
          const crown = new THREE.Mesh(this.geos.crown, rand() < 0.5 ? this.mats.leaf : this.mats.leaf2);
          crown.position.copy(trunk.position).setY(trunk.position.y + 2.8);
          crown.scale.setScalar(0.8 + rand() * 0.6);
          g.add(trunk, crown);
        } else {
          const bush = new THREE.Mesh(this.geos.bush, this.mats.leaf2);
          bush.position.copy(p).setY(-0.2);
          g.add(bush);
        }
      }
    }
  }

  /** Path tiles with low stone edges from `from` along `dir`, between distances a and b. */
  private path(g: THREE.Group, from: THREE.Vector3, heading: number, a: number, b: number, out?: THREE.Object3D[]) {
    const dir = fwd(heading);
    const side = new THREE.Vector3().crossVectors(dir, UP).normalize();
    let k = 0;
    for (let d = a + TILE / 2; d < b; d += TILE, k++) {
      const c = from.clone().addScaledVector(dir, d);
      const tile = new THREE.Mesh(this.geos.tile, k % 3 === 1 ? this.mats.stone2 : this.mats.stone);
      tile.position.copy(c).setY(-0.3);
      tile.rotation.y = heading;
      g.add(tile);
      out?.push(tile);
      for (const sgn of [-1, 1]) {
        const edge = new THREE.Mesh(this.geos.edge, k % 4 === 0 ? this.mats.moss : this.mats.edge);
        edge.position.copy(c).addScaledVector(side, sgn * (WIDTH / 2 + 0.2)).setY(0.05);
        edge.rotation.y = heading;
        g.add(edge);
        out?.push(edge);
      }
    }
  }

  /**
   * The next stretch: a straight path of about `seconds` of running that ends in a fork with these two
   * answers. It starts where he is now, in the direction he's facing.
   */
  newFork(seconds: number, labels: Record<Side, string>) {
    const start = this.fork ? this.forkPoint(this.fork) : new THREE.Vector3();
    // Mid-turn, the new stretch already goes the way he is turning.
    const heading = this.state === 'turn' ? this.turnTo : this.heading;
    const length = Math.max(28, Math.round((SPEED * seconds) / TILE) * TILE);
    const g = new THREE.Group();
    const dir = fwd(heading);
    // The way he came in already has its first stretch (the stub he turned into).
    const from = this.fork ? STUB : 0;
    this.path(g, start, heading, from, length - WIDTH / 2);
    const corner = start.clone().addScaledVector(dir, length);
    // The crossing at the fork.
    const plate = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, 0.6, WIDTH), this.mats.stone);
    plate.position.copy(corner).setY(-0.3);
    plate.rotation.y = heading;
    g.add(plate);
    const stubs: Record<Side, THREE.Object3D[]> = { left: [], right: [] };
    const signs = {} as Record<Side, THREE.Mesh>;
    for (const sd of ['left', 'right'] as const) {
      const h = heading + (sd === 'left' ? LEFT : -LEFT);
      const sdir = fwd(h);
      const base = corner.clone().addScaledVector(sdir, WIDTH / 2);
      this.path(g, base, h, 0, STUB - WIDTH / 2, stubs[sd]);
      // A wooden sign over the entrance of each way, facing him as he comes up the path.
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: signTexture(labels[sd], sd), transparent: false }));
      const at = corner.clone().addScaledVector(sdir, WIDTH / 2 + 1.6).addScaledVector(dir, -WIDTH / 2 - 0.4);
      sign.position.copy(at).setY(4.1);
      sign.rotation.y = heading;
      g.add(sign);
      signs[sd] = sign;
      for (const o of [-2.1, 2.1]) {
        const post = new THREE.Mesh(this.geos.post, this.mats.post);
        post.scale.y = 1.3;
        post.position.copy(at).addScaledVector(sdir, o).setY(2.2);
        g.add(post);
      }
      this.scenery(g, corner.clone().addScaledVector(sdir, WIDTH), sdir, STUB, 7 + length);
    }
    // Straight ahead: the drop, with a broken edge and two warning pillars.
    for (const o of [-1.6, 1.6]) {
      const p = new THREE.Mesh(this.geos.pillar, this.mats.pillar);
      p.position.copy(corner).addScaledVector(dir, WIDTH / 2 + 0.6).addScaledVector(new THREE.Vector3().crossVectors(dir, UP), o).setY(-0.4);
      p.scale.set(0.7, 0.7, 0.7);
      g.add(p);
    }
    this.scenery(g, start, dir, length - 6, 3 + length);
    // A line of coins down the middle.
    const coins: THREE.Mesh[] = [];
    for (let d = from + 5; d < length - 6; d += 3.2) {
      const coin = new THREE.Mesh(this.geos.coin, this.mats.coin);
      coin.position.copy(start).addScaledVector(dir, d).setY(1.1);
      coin.userData.d = d;
      g.add(coin);
      coins.push(coin);
    }
    this.scene.add(g);
    const f: Fork = { group: g, start, heading, length, stubs, signs, coins };
    this.forks.push(f);
    // Old stretches far behind are removed.
    while (this.forks.length > 3) {
      const old = this.forks.shift()!;
      this.scene.remove(old.group);
      old.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshBasicMaterial).map) {
          (mesh.material as THREE.MeshBasicMaterial).map!.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
    }
    this.fork = f;
    this.chosen = null;
    // Carry on from wherever he is along the new stretch (he may already be a few steps into it).
    const along = this.pos.clone().sub(start).dot(dir);
    this.s = this.forks.length > 1 ? Math.max(0, Math.min(length - 1, along)) : 0;
    this.heading = heading;
    this.pos.copy(start).addScaledVector(dir, this.s);
    this.pos.y = 0;
    this.hero.rotation.x = 0;
    this.state = 'run';
  }

  private forkPoint(f: Fork) {
    return f.start.clone().addScaledVector(fwd(f.heading), f.length);
  }

  /** He swiped: lean that way and hurry to the corner. */
  choose(side: Side) {
    if (this.state !== 'run') return;
    this.chosen = side;
    if (this.fork)
      for (const sd of ['left', 'right'] as const) this.fork.signs[sd].scale.setScalar(sd === side ? 1.12 : 0.92);
  }

  setPaused(p: boolean) {
    if (p && this.state === 'run') this.state = 'paused';
    else if (!p && this.state === 'paused' && this.fork) this.state = 'run';
  }

  /** At the fork: turn into the chosen way. Wrong (or no turn) → fall; then carry on along the right way. */
  resolve(side: Side | null, right: Side, done: () => void) {
    const f = this.fork;
    if (!f) return done();
    const corner = this.forkPoint(f);
    const turn = (sd: Side) => {
      this.state = 'turn';
      this.turnFrom.copy(corner);
      this.turnT = 0;
      this.turnTo = f.heading + (sd === 'left' ? LEFT : -LEFT);
    };
    if (side === right) {
      turn(side);
      setTimeout(done, 700);
      return;
    }
    if (side) {
      // The wrong way crumbles under him.
      turn(side);
      setTimeout(() => {
        for (const o of f.stubs[side]) this.crumbling.push({ o, v: Math.random() * 2, r: (Math.random() - 0.5) * 3 });
        this.state = 'fall';
        this.fallV = 0;
      }, 380);
    } else {
      this.state = 'fall';
      this.fallV = 2;
    }
    // After the fall he is back at the corner, facing the right way.
    setTimeout(() => {
      this.heading = this.look = f.heading + (right === 'left' ? LEFT : -LEFT);
      this.pos.copy(corner);
      this.hero.rotation.set(0, this.heading, 0);
      this.state = 'turn';
      this.turnFrom.copy(corner);
      this.turnT = 1;
      this.turnTo = this.heading;
      done();
    }, 1500);
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const f = this.fork;
    if (f && (this.state === 'run' || this.state === 'wait')) {
      const speed = this.chosen ? RUSH : SPEED;
      this.s = Math.min(f.length, this.s + speed * dt);
      this.pos.copy(f.start).addScaledVector(fwd(f.heading), this.s);
      for (const c of f.coins)
        if (c.visible && Math.abs(c.userData.d - this.s) < 0.8) {
          c.visible = false;
          this.onCoin();
        }
      if (this.s >= f.length && this.state === 'run') {
        this.state = 'wait';
        this.onFork(this.chosen);
      }
    } else if (this.state === 'turn') {
      // Swing round the corner, then keep running down the new way.
      this.turnT = Math.min(1, this.turnT + dt / 0.5);
      const from = f ? f.heading : this.heading;
      this.heading = from + (this.turnTo - from) * this.turnT;
      this.pos.addScaledVector(fwd(this.turnTo), SPEED * dt);
    } else if (this.state === 'fall') {
      this.fallV += 22 * dt;
      this.pos.y -= this.fallV * dt;
      this.pos.addScaledVector(fwd(this.heading), 3 * dt);
      this.hero.rotation.x -= 3 * dt;
    }
    for (const c of this.crumbling) {
      c.v += 20 * dt;
      c.o.position.y -= c.v * dt;
      c.o.rotation.z += c.r * dt;
    }
    this.crumbling = this.crumbling.filter((c) => c.o.position.y > -30);
    // Coins spin.
    if (f) for (const c of f.coins) c.rotation.y += dt * 3;

    // The hero: running legs and arms.
    this.hero.position.copy(this.pos);
    if (this.state !== 'fall') this.hero.rotation.set(0, this.heading, this.chosen && this.state === 'run' ? (this.chosen === 'left' ? 0.25 : -0.25) : 0);
    const run = this.state === 'paused' ? 0 : Math.sin(this.time * 14);
    this.legs.forEach((l, i) => (l.rotation.x = run * 0.8 * (i ? 1 : -1)));
    this.arms.forEach((a, i) => (a.rotation.x = run * 0.7 * (i ? -1 : 1)));
    this.hero.position.y += this.state === 'fall' ? 0 : Math.abs(run) * 0.12;

    // Camera behind and above, easing round corners.
    this.look += (this.heading - this.look) * Math.min(1, dt * 8);
    const back = fwd(this.look);
    let target: THREE.Vector3;
    let cam: THREE.Vector3;
    if (this.state === 'fall' && this.fork) {
      // Falling: the camera stays up at the corner and watches him drop into the gap.
      const corner = this.forkPoint(this.fork);
      cam = corner.clone().addScaledVector(fwd(this.fork.heading), -7).setY(7.5);
      target = this.hero.position.clone();
    } else {
      target = this.pos.clone().addScaledVector(back, 12).setY(1.6);
      cam = this.pos.clone().addScaledVector(back, -6.4).setY(this.pos.y + 4.4);
    }
    this.camera.position.lerp(cam, Math.min(1, dt * 10));
    this.camera.lookAt(target);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.MeshBasicMaterial | undefined;
      if (mat) {
        mat.map?.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
