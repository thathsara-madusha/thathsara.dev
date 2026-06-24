<script lang="ts">
  let { src = '/fixed.glb' }: { src?: string } = $props();

  let canvas = $state<HTMLCanvasElement | undefined>(undefined);
  let wrap = $state<HTMLDivElement | undefined>(undefined);
  let status = $state('loading…');
  let progress = $state(0);
  let ready = $state(false);

  $effect(() => {
    if (!canvas || !wrap) return;
    let raf = 0;
    let disposed = false;
    let cleanupResize: (() => void) | undefined;

    (async () => {
      const THREE = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
      const { GLTFLoader } = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/controls/OrbitControls.js');
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
      camera.position.set(0, 0, 4);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.9;
      controls.enablePan = false;

      const resize = () => {
        const w = wrap!.clientWidth, h = wrap!.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resize);
      cleanupResize = () => window.removeEventListener('resize', resize);
      resize();

      // soft circular blue glow sprite
      const sc = document.createElement('canvas');
      sc.width = sc.height = 64;
      const g = sc.getContext('2d')!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0.0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.25, 'rgba(180,220,255,0.95)');
      grad.addColorStop(0.55, 'rgba(120,170,255,0.45)');
      grad.addColorStop(1.0, 'rgba(90,140,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      const sprite = new THREE.CanvasTexture(sc);
      sprite.colorSpace = THREE.SRGBColorSpace;

      // area-weighted surface sampler → even point cloud
      const samplePoints = (meshes: any[], targetCount: number) => {
        const tris: any[] = [];
        let totalArea = 0;
        const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
        const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3();
        for (const mesh of meshes) {
          const geo = mesh.geometry;
          const pos = geo.attributes.position;
          if (!pos) continue;
          mesh.updateWorldMatrix(true, false);
          const m = mesh.matrixWorld;
          const index = geo.index;
          const triCount = index ? index.count / 3 : pos.count / 3;
          for (let t = 0; t < triCount; t++) {
            let a, b, c;
            if (index) { a = index.getX(t * 3); b = index.getX(t * 3 + 1); c = index.getX(t * 3 + 2); }
            else { a = t * 3; b = t * 3 + 1; c = t * 3 + 2; }
            vA.fromBufferAttribute(pos, a).applyMatrix4(m);
            vB.fromBufferAttribute(pos, b).applyMatrix4(m);
            vC.fromBufferAttribute(pos, c).applyMatrix4(m);
            ab.subVectors(vB, vA); ac.subVectors(vC, vA);
            const area = cross.crossVectors(ab, ac).length() * 0.5;
            if (area <= 0) continue;
            totalArea += area;
            tris.push({ a: vA.clone(), b: vB.clone(), c: vC.clone(), area });
          }
        }
        const out = new Float32Array(targetCount * 3);
        if (!tris.length) return out;
        const p = new THREE.Vector3();
        const e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
        for (let i = 0; i < targetCount; i++) {
          let r = Math.random() * totalArea;
          let tri = tris[tris.length - 1];
          for (let k = 0; k < tris.length; k++) { r -= tris[k].area; if (r <= 0) { tri = tris[k]; break; } }
          let u = Math.random(), v = Math.random();
          if (u + v > 1) { u = 1 - u; v = 1 - v; }
          e1.subVectors(tri.b, tri.a); e2.subVectors(tri.c, tri.a);
          p.copy(tri.a).addScaledVector(e1, u).addScaledVector(e2, v);
          out[i * 3] = p.x; out[i * 3 + 1] = p.y; out[i * 3 + 2] = p.z;
        }
        return out;
      };

      let points: any = null;
      let basePositions: Float32Array | null = null;
      let scattered: Float32Array | null = null;
      let introActive = false, introT = 0;

      const loader = new GLTFLoader();
      loader.load(
        src,
        (gltf: any) => {
          if (disposed) return;
          const root = gltf.scene;
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const scale = 2.4 / Math.max(size.x, size.y, size.z);
          root.position.sub(center);
          root.scale.setScalar(scale);
          root.updateWorldMatrix(true, true);

          const meshes: any[] = [];
          root.traverse((o: any) => { if (o.isMesh && o.geometry) meshes.push(o); });

          const arr = samplePoints(meshes, 90000);
          basePositions = arr;
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
          const mat = new THREE.PointsMaterial({
            size: 0.012, map: sprite, transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending, sizeAttenuation: true,
            color: new THREE.Color(0x9fc4ff),
          });
          points = new THREE.Points(geo, mat);
          scene.add(points);

          // intro: scatter → settle
          scattered = new Float32Array(arr.length);
          const dir = new THREE.Vector3();
          for (let i = 0; i < arr.length; i += 3) {
            dir.set(arr[i], arr[i + 1], arr[i + 2]).normalize();
            const rr = 2.2 + Math.random() * 1.5;
            scattered[i] = dir.x * rr + (Math.random() - 0.5);
            scattered[i + 1] = dir.y * rr + (Math.random() - 0.5);
            scattered[i + 2] = dir.z * rr + (Math.random() - 0.5);
          }
          introActive = true; introT = 0;

          status = 'ready';
          ready = true;
        },
        (e: any) => {
          if (e.lengthComputable) {
            progress = Math.round((e.loaded / e.total) * 100);
            status = `loading ${progress}%`;
          }
        },
        () => { status = 'load failed'; }
      );

      const clock = new THREE.Clock();
      const tick = () => {
        const dt = clock.getDelta();
        const t = clock.elapsedTime;
        if (introActive && points && scattered && basePositions) {
          introT = Math.min(1, introT + dt * 0.6);
          const e = 1 - Math.pow(1 - introT, 3);
          const arr = points.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < arr.length; i++) arr[i] = scattered[i] + (basePositions[i] - scattered[i]) * e;
          points.geometry.attributes.position.needsUpdate = true;
          if (introT >= 1) introActive = false;
        }
        if (points) points.material.size = 0.011 + Math.sin(t * 1.5) * 0.0015;
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanupResize = (() => {
        const prev = cleanupResize;
        return () => {
          prev?.();
          cancelAnimationFrame(raf);
          renderer.dispose();
        };
      })();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanupResize?.();
    };
  });
</script>

<div class="cloud" bind:this={wrap}>
  <canvas bind:this={canvas}></canvas>
  {#if !ready}
    <div class="overlay">
      <div class="spinner"></div>
      <span>{status}</span>
    </div>
  {/if}
  <div class="gizmo" aria-hidden="true">
    <span class="ax x">X</span><span class="ax y">Y</span><span class="ax z">Z</span><span class="dot"></span>
  </div>
</div>

<style>
  .cloud {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 320px;
    overflow: hidden;
    background: radial-gradient(700px 500px at 50% 45%, rgba(122,162,247,0.06), transparent 70%);
  }
  canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
  canvas:active { cursor: grabbing; }

  .overlay {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; color: var(--fg-mute); font-family: var(--mono); font-size: 11px;
    pointer-events: none;
  }
  .spinner {
    width: 24px; height: 24px;
    border: 2px solid var(--line-strong); border-top-color: var(--azure);
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .gizmo { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; pointer-events: none; opacity: 0.8; }
  .ax { position: absolute; font-size: 10px; font-weight: 700; font-family: var(--mono); }
  .x { left: 0; top: 50%; transform: translateY(-50%); color: var(--coral); }
  .y { left: 50%; top: 0; transform: translateX(-50%); color: var(--mint); }
  .z { right: 2px; bottom: 2px; color: var(--azure); }
  .dot { position: absolute; left: 50%; top: 50%; width: 5px; height: 5px; margin: -2.5px; border-radius: 50%; background: var(--fg-soft); }
</style>
