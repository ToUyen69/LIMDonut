import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShapeGeometry, SHAPES, FLAVORS, SAUCES, TOPPINGS, DonutVariant } from './party.config';
import { ToppingData } from './donut-renderer';

export type ArrangementType = 'none' | 'pyramid' | 'circle' | 'heart';

interface SlotDonut {
  group: THREE.Group;
  variantIndex: number;
}

interface TweenAnim {
  groupA: THREE.Group;
  groupB: THREE.Group;
  startA: THREE.Vector3;
  startB: THREE.Vector3;
  endA: THREE.Vector3;
  endB: THREE.Vector3;
  t: number;
  duration: number;
}

const DONUT_SCALE = 0.3;
const SLOT_SPACING = 1.6;

export class PartySetRenderer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;

  private slots: SlotDonut[] = [];
  private slotPositions: THREE.Vector3[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private selectedSlotIndex = -1;
  private activeTween: TweenAnim | null = null;

  private canvas!: HTMLCanvasElement;
  private onSwapCallback: ((a: number, b: number) => void) | null = null;
  private onSelectCallback: ((index: number) => void) | null = null;
  private groundPlane: THREE.Mesh | null = null;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 420;

    this.scene = new THREE.Scene();
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 2; bgCanvas.height = 256;
    const ctx = bgCanvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#d4eaf7');
    grad.addColorStop(0.5, '#f5f0e8');
    grad.addColorStop(1, '#faf6ef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    bgTexture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = bgTexture;

    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 200);
    this.camera.position.set(0, 9, 11);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableZoom = true;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 28;
    this.controls.target.set(0, 0, 0);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.8;
    this.controls.maxPolarAngle = Math.PI * 0.45;
    this.controls.minPolarAngle = Math.PI * 0.1;

    this.setupLights();
    this.addGround();

    canvas.addEventListener('click', (e) => this.onClick(e));
    this.animate();

    const ro = new ResizeObserver(() => this.onResize());
    ro.observe(canvas.parentElement!);
  }

  onSwap(cb: (a: number, b: number) => void) { this.onSwapCallback = cb; }
  onSelect(cb: (index: number) => void) { this.onSelectCallback = cb; }

  private setupLights() {
    this.scene.add(new THREE.AmbientLight(0xfff5ee, 0.65));

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 10, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    key.shadow.bias = -0.002;
    key.shadow.radius = 4;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xddeeff, 0.35);
    fill.position.set(-6, 4, -4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffeedd, 0.2);
    rim.position.set(0, 1, -8);
    this.scene.add(rim);
  }

  private addGround() {
    const geo = new THREE.PlaneGeometry(30, 30);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.9, metalness: 0 });
    this.groundPlane = new THREE.Mesh(geo, mat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.position.y = -0.12;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);
  }

  updateSet(variants: DonutVariant[], arrangement: ArrangementType, slotAssignments: number[]) {
    this.clearSlots();
    this.selectedSlotIndex = -1;
    this.activeTween = null;

    const totalCount = slotAssignments.length;
    if (totalCount === 0) return;

    this.slotPositions = this.computePositions(totalCount, arrangement);
    this.adjustCamera(totalCount, arrangement);

    for (let i = 0; i < totalCount; i++) {
      const vIdx = slotAssignments[i];
      const variant = variants[vIdx];
      if (!variant) continue;

      const group = this.buildDonutGroup(variant, DONUT_SCALE, i);
      const pos = this.slotPositions[i];
      group.position.copy(pos);
      group.userData['slotIndex'] = i;
      this.scene.add(group);
      this.slots.push({ group, variantIndex: vIdx });
    }
  }

  private adjustCamera(count: number, arrangement: ArrangementType) {
    const spread = Math.sqrt(count) * SLOT_SPACING * 0.55;
    const dist = Math.max(7, spread * 2.0);
    const angle = 30 * Math.PI / 180;
    const camY = dist * Math.sin(angle);
    const camZ = dist * Math.cos(angle);
    let targetY = 0;
    if (arrangement === 'pyramid') {
      targetY = Math.min(count * 0.08, 2.5);
      this.camera.position.set(0, camY + targetY, camZ);
    } else {
      this.camera.position.set(0, camY, camZ);
    }
    this.controls.target.set(0, targetY, 0);
    this.controls.minDistance = dist * 0.3;
    this.controls.maxDistance = dist * 3;
  }

  computePositions(count: number, arrangement: ArrangementType): THREE.Vector3[] {
    switch (arrangement) {
      case 'pyramid': return this.pyramidLayout(count);
      case 'circle': return this.circleLayout(count);
      case 'heart': return this.heartLayout(count);
      default: return this.gridLayout(count);
    }
  }

  private jitter(): number {
    return (Math.random() - 0.5) * SLOT_SPACING * 0.05;
  }

  private gridLayout(count: number): THREE.Vector3[] {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const rowCount = row < rows - 1 ? cols : count - row * cols;
      const x = (col - (rowCount - 1) / 2) * SLOT_SPACING + this.jitter();
      const z = (row - (rows - 1) / 2) * SLOT_SPACING + this.jitter();
      positions.push(new THREE.Vector3(x, 0, z));
    }
    return positions;
  }

  private pyramidLayout(count: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const layers: number[] = [];
    let remaining = count;
    let layerSide = Math.ceil(Math.sqrt(count));
    if (layerSide * layerSide === count) layerSide++;
    while (remaining > 0 && layerSide > 0) {
      const cap = layerSide * layerSide;
      const thisLayer = Math.min(remaining, cap);
      layers.push(thisLayer);
      remaining -= thisLayer;
      layerSide = Math.max(1, layerSide - 1);
      if (thisLayer <= 1) break;
    }
    if (remaining > 0) layers[layers.length - 1] += remaining;
    if (layers.length === 1 && count > 3) {
      const bottom = Math.ceil(count * 0.65);
      const top = count - bottom;
      layers.length = 0;
      layers.push(bottom, top);
    }

    const tightSpacing = SLOT_SPACING * 0.82;
    const yStep = 0.9;
    for (let li = 0; li < layers.length; li++) {
      const n = layers[li];
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      const shrink = 1 - li * 0.12;
      const sp = tightSpacing * shrink;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const rowCount = row < rows - 1 ? cols : n - row * cols;
        const x = (col - (rowCount - 1) / 2) * sp + this.jitter();
        const z = (row - (rows - 1) / 2) * sp + this.jitter();
        positions.push(new THREE.Vector3(x, li * yStep, z));
      }
    }
    return positions;
  }

  private circleLayout(count: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    if (count <= 1) { positions.push(new THREE.Vector3(0, 0, 0)); return positions; }

    const circumference = count * SLOT_SPACING * 0.85;
    const radius = circumference / (2 * Math.PI);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius + this.jitter();
      const z = Math.sin(angle) * radius + this.jitter();
      positions.push(new THREE.Vector3(x, 0, z));
    }
    return positions;
  }

  private heartLayout(count: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const s = SLOT_SPACING * 0.18;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hz = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      positions.push(new THREE.Vector3(hx * s + this.jitter(), 0, -hz * s + this.jitter()));
    }
    return positions;
  }

  private buildDonutGroup(variant: DonutVariant, scale: number, slotIdx: number): THREE.Group {
    const group = new THREE.Group();
    const shape = SHAPES.find(s => s.id === variant.shapeId);
    const geo = shape?.geometry ?? 'torus';

    const bodyGeo = this.buildBodyGeometry(geo, scale);
    const flavor = FLAVORS.find(f => f.id === variant.flavorId);
    const bodyColor = flavor?.baseColor ?? '#E8C98E';
    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(bodyColor), roughness: 0.72, metalness: 0.03 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    group.add(body);

    const sauce = SAUCES.find(s => s.id === variant.sauceId);
    if (sauce) {
      const glazeGeo = this.buildBodyGeometry(geo, scale * 1.02);
      const glazeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(sauce.color),
        roughness: 0.08, metalness: 0.05,
        clearcoat: sauce.glossy ? 1.0 : 0.3,
        clearcoatRoughness: 0.04,
        transparent: true, opacity: 0.9,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const glaze = new THREE.Mesh(glazeGeo, glazeMat);
      glaze.rotation.x = Math.PI / 2;
      glaze.position.y = 0.012;
      glaze.castShadow = true;
      group.add(glaze);
    }

    const toppingData: ToppingData[] = TOPPINGS
      .filter(t => variant.toppingIds.includes(t.id))
      .map(t => ({ colors: t.particleColors, shape: t.particleShape }));
    if (toppingData.length > 0) this.addToppings(group, toppingData, scale, slotIdx);

    return group;
  }

  private addToppings(group: THREE.Group, toppings: ToppingData[], scale: number, slotIdx: number) {
    const toppingGroup = new THREE.Group();
    const perTopping = Math.min(Math.floor(16 / toppings.length), 10);
    let seed = 42 + slotIdx * 137;
    const rand = () => { seed = (seed * 16807) % 2147483647; return Math.abs(seed) / 2147483647; };
    const R = 1.2 * scale, r = 0.55 * scale;

    toppings.forEach(topping => {
      for (let i = 0; i < perTopping; i++) {
        const theta = rand() * Math.PI * 2;
        const phi = rand() * Math.PI * 0.6 - Math.PI * 0.1;
        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
        const z = (R + r * Math.cos(phi)) * Math.sin(theta);
        const y = r * Math.sin(phi);
        if (y < -0.02 * scale) continue;

        let geo: THREE.BufferGeometry;
        const s = scale / 0.3;
        if (topping.shape === 'circle') geo = new THREE.SphereGeometry((0.03 + rand() * 0.02) * s, 4, 4);
        else if (topping.shape === 'rect') { const w = (0.025 + rand() * 0.02) * s; geo = new THREE.BoxGeometry(w, 0.015 * s, w * (1.5 + rand())); }
        else geo = new THREE.CylinderGeometry(0.012 * s, 0.012 * s, (0.06 + rand() * 0.03) * s, 4);

        const color = topping.colors[Math.floor(rand() * topping.colors.length)];
        const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        toppingGroup.add(mesh);
      }
    });
    toppingGroup.rotation.x = Math.PI / 2;
    group.add(toppingGroup);
  }

  private buildBodyGeometry(shape: ShapeGeometry, scale: number): THREE.BufferGeometry {
    const R = 1.2 * scale, r = 0.55 * scale;
    switch (shape) {
      case 'torus': return new THREE.TorusGeometry(R, r, 22, 40);
      case 'square': {
        const path = new THREE.CurvePath<THREE.Vector3>();
        const s = R;
        const c = [new THREE.Vector3(s,0,s), new THREE.Vector3(-s,0,s), new THREE.Vector3(-s,0,-s), new THREE.Vector3(s,0,-s)];
        for (let i = 0; i < 4; i++) path.add(new THREE.LineCurve3(c[i], c[(i+1)%4]));
        return new THREE.TubeGeometry(path as any, 28, r, 14, true);
      }
      case 'heart': {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 50; i++) {
          const t = (i/50)*Math.PI*2;
          pts.push(new THREE.Vector3(16*Math.pow(Math.sin(t),3)*0.075*scale, 0, -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*0.075*scale));
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 44, 0.5*scale, 14, true);
      }
      case 'star': {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 10; i++) {
          const a = (i/10)*Math.PI*2 - Math.PI/2;
          const rd = (i%2===0?1.3:0.65)*scale;
          pts.push(new THREE.Vector3(Math.cos(a)*rd, 0, Math.sin(a)*rd));
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 44, 0.4*scale, 14, true);
      }
      case 'hexagon': {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 6; i++) { const a=(i/6)*Math.PI*2 - Math.PI/2; pts.push(new THREE.Vector3(Math.cos(a)*R, 0, Math.sin(a)*R)); }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 28, r, 14, true);
      }
    }
  }

  private onClick(event: MouseEvent) {
    if (this.activeTween) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes: THREE.Object3D[] = [];
    this.slots.forEach(s => s.group.traverse(obj => { if (obj instanceof THREE.Mesh && obj !== this.groundPlane) meshes.push(obj); }));

    const intersects = this.raycaster.intersectObjects(meshes, false);
    if (intersects.length === 0) {
      this.deselectCurrent();
      return;
    }

    let clickedSlotIndex = -1;
    let hitObj = intersects[0].object;
    while (hitObj) {
      if (hitObj.userData['slotIndex'] !== undefined) { clickedSlotIndex = hitObj.userData['slotIndex']; break; }
      hitObj = hitObj.parent as THREE.Object3D;
    }
    if (clickedSlotIndex < 0) return;

    if (this.selectedSlotIndex < 0) {
      this.selectedSlotIndex = clickedSlotIndex;
      this.highlightSlot(clickedSlotIndex, true);
      this.onSelectCallback?.(clickedSlotIndex);
    } else if (this.selectedSlotIndex === clickedSlotIndex) {
      this.deselectCurrent();
    } else {
      this.startSwapTween(this.selectedSlotIndex, clickedSlotIndex);
    }
  }

  private highlightSlot(index: number, on: boolean) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.group.scale.setScalar(on ? 1.08 : 1.0);
    slot.group.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (on) { mat.emissive = new THREE.Color(0x4a90e2); mat.emissiveIntensity = 0.25; }
        else { mat.emissive = new THREE.Color(0x000000); mat.emissiveIntensity = 0; }
      }
    });
  }

  private deselectCurrent() {
    if (this.selectedSlotIndex >= 0) this.highlightSlot(this.selectedSlotIndex, false);
    this.selectedSlotIndex = -1;
    this.onSelectCallback?.(-1);
  }

  private startSwapTween(a: number, b: number) {
    this.highlightSlot(a, false);
    const gA = this.slots[a].group;
    const gB = this.slots[b].group;
    this.activeTween = {
      groupA: gA, groupB: gB,
      startA: gA.position.clone(), startB: gB.position.clone(),
      endA: gB.position.clone(), endB: gA.position.clone(),
      t: 0, duration: 350,
    };
    this.selectedSlotIndex = -1;
    this.onSelectCallback?.(-1);
  }

  private updateTween(deltaMs: number) {
    if (!this.activeTween) return;
    const tw = this.activeTween;
    tw.t += deltaMs;
    const progress = Math.min(tw.t / tw.duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    const liftHeight = 0.6;
    const lift = Math.sin(ease * Math.PI) * liftHeight;

    tw.groupA.position.lerpVectors(tw.startA, tw.endA, ease);
    tw.groupA.position.y += lift;
    tw.groupB.position.lerpVectors(tw.startB, tw.endB, ease);
    tw.groupB.position.y += lift;

    if (progress >= 1) {
      tw.groupA.position.copy(tw.endA);
      tw.groupB.position.copy(tw.endB);

      const idxA = tw.groupA.userData['slotIndex'];
      const idxB = tw.groupB.userData['slotIndex'];
      tw.groupA.userData['slotIndex'] = idxB;
      tw.groupB.userData['slotIndex'] = idxA;
      [this.slotPositions[idxA], this.slotPositions[idxB]] = [this.slotPositions[idxB], this.slotPositions[idxA]];

      this.activeTween = null;
      this.onSwapCallback?.(idxA, idxB);
    }
  }

  clearSelection() {
    this.deselectCurrent();
  }

  private clearSlots() {
    this.slots.forEach(s => {
      this.scene.remove(s.group);
      s.group.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else (obj.material as THREE.Material).dispose();
        }
      });
    });
    this.slots = [];
    this.slotPositions = [];
  }

  private lastTime = 0;
  private animate() {
    this.animationId = requestAnimationFrame((time) => {
      const delta = this.lastTime ? time - this.lastTime : 16;
      this.lastTime = time;
      this.updateTween(delta);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.animate();
    });
  }

  private onResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.clearSlots();
    if (this.groundPlane) {
      this.scene.remove(this.groundPlane);
      this.groundPlane.geometry.dispose();
      (this.groundPlane.material as THREE.Material).dispose();
    }
    this.controls.dispose();
    this.renderer.dispose();
  }
}
