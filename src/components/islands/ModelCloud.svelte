<script lang="ts">
  let {
    src = '/me.glb',
    hiSrc = '/fixed.glb',
    lockLook = false,
    shiftX = 0,
    disableHiRes = false, // <-- Added prop
  }: { 
    src?: string; 
    hiSrc?: string; 
    lockLook?: boolean; 
    shiftX?: number;
    disableHiRes?: boolean; // <-- Added type
  } = $props();

  let canvas = $state<HTMLCanvasElement | undefined>(undefined);
  let wrap = $state<HTMLDivElement | undefined>(undefined);
  let status = $state('loading…');
  let progress = $state(0);
  let ready = $state(false);
  let hiLoading = $state(false);
  let hiPhrase = $state('');
  let hiProgress = $state(0);

  // rotating status lines while the heavy textured model streams in
  const hiPhrases = [
    'loading textures…',
    'downloading polygons…',
    'unwrapping UVs…',
    'baking the lighting…',
    'polishing pixels…',
    'combing the mesh…',
    'summoning high-res me…',
    'ironing out the normals…',
    'rendering my good side…',
  ];

  $effect(() => {
    if (!canvas || !wrap) return;
    let raf = 0;
    let disposed = false;
    let cleanupResize: (() => void) | undefined;

    (async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      const scene = new THREE.Scene();
      
      const keyLight = new THREE.DirectionalLight(0x7aa2f7, 3.0);
      keyLight.position.set(2, 3, 4);
      scene.add(keyLight);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;
      scene.environmentIntensity = 0.5;
      pmrem.dispose(); 
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
      camera.position.set(-shiftX, 0, 4);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = false;
      controls.enablePan = false;
      controls.target.set(-shiftX, 0, 0);
      controls.update();
      controls.enableRotate = !lockLook;
      controls.enableZoom = !lockLook;

      let points: any = null;
      let actual: any = null; 
      let cloudShownAt = 0;   
      let swapTimer: ReturnType<typeof setTimeout> | undefined;
      let phraseTimer: ReturnType<typeof setInterval> | undefined;
      const MIN_CLOUD_MS = 5000; 

      let scrollProgress = 0;
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      const resize = () => {
        const w = wrap!.clientWidth, h = wrap!.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (points) points.material.uniforms.uScale.value = renderer.domElement.height * 0.5;
      };
      window.addEventListener('resize', resize);
      cleanupResize = () => window.removeEventListener('resize', resize);
      resize();

      const sc = document.createElement('canvas');
      sc.width = sc.height = 64;
      const g = sc.getContext('2d')!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0.0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.45, 'rgba(255,255,255,1)');
      grad.addColorStop(0.75, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1.0, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      const sprite = new THREE.CanvasTexture(sc);
      sprite.colorSpace = THREE.SRGBColorSpace;

      const samplePoints = (meshes: any[], targetCount: number) => {
        const out = new Float32Array(targetCount * 3);
        const nrm = new Float32Array(targetCount * 3);

        let triCount = 0;
        for (const mesh of meshes) {
          const pos = mesh.geometry.attributes.position;
          if (!pos) continue;
          const index = mesh.geometry.index;
          triCount += index ? index.count / 3 : pos.count / 3;
        }
        if (!triCount) return { positions: out, normals: nrm };

        const triVerts = new Float32Array(triCount * 9); 
        const cumArea = new Float64Array(triCount);       
        const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
        const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3();

        let ti = 0;
        let totalArea = 0;
        for (const mesh of meshes) {
          const geo = mesh.geometry;
          const pos = geo.attributes.position;
          if (!pos) continue;
          mesh.updateWorldMatrix(true, false);
          const m = mesh.matrixWorld;
          const index = geo.index;
          const count = index ? index.count / 3 : pos.count / 3;
          for (let t = 0; t < count; t++) {
            let a, b, c;
            if (index) { a = index.getX(t * 3); b = index.getX(t * 3 + 1); c = index.getX(t * 3 + 2); }
            else { a = t * 3; b = t * 3 + 1; c = t * 3 + 2; }
            vA.fromBufferAttribute(pos, a).applyMatrix4(m);
            vB.fromBufferAttribute(pos, b).applyMatrix4(m);
            vC.fromBufferAttribute(pos, c).applyMatrix4(m);
            ab.subVectors(vB, vA); ac.subVectors(vC, vA);
            totalArea += cross.crossVectors(ab, ac).length() * 0.5;
            const o = ti * 9;
            triVerts[o] = vA.x; triVerts[o + 1] = vA.y; triVerts[o + 2] = vA.z;
            triVerts[o + 3] = vB.x; triVerts[o + 4] = vB.y; triVerts[o + 5] = vB.z;
            triVerts[o + 6] = vC.x; triVerts[o + 7] = vC.y; triVerts[o + 8] = vC.z;
            cumArea[ti] = totalArea;
            ti++;
          }
        }
        if (totalArea <= 0) return { positions: out, normals: nrm };

        for (let i = 0; i < targetCount; i++) {
          const r = Math.random() * totalArea;
          let lo = 0, hi = ti - 1;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cumArea[mid] < r) lo = mid + 1; else hi = mid;
          }
          const o = lo * 9;
          let u = Math.random(), v = Math.random();
          if (u + v > 1) { u = 1 - u; v = 1 - v; }
          const ax = triVerts[o], ay = triVerts[o + 1], az = triVerts[o + 2];
          const e1x = triVerts[o + 3] - ax, e1y = triVerts[o + 4] - ay, e1z = triVerts[o + 5] - az;
          const e2x = triVerts[o + 6] - ax, e2y = triVerts[o + 7] - ay, e2z = triVerts[o + 8] - az;
          out[i * 3]     = ax + e1x * u + e2x * v;
          out[i * 3 + 1] = ay + e1y * u + e2y * v;
          out[i * 3 + 2] = az + e1z * u + e2z * v;
          
          let nx = e1y * e2z - e1z * e2y;
          let ny = e1z * e2x - e1x * e2z;
          let nz = e1x * e2y - e1y * e2x;
          const nl = Math.hypot(nx, ny, nz) || 1;
          nrm[i * 3] = nx / nl; nrm[i * 3 + 1] = ny / nl; nrm[i * 3 + 2] = nz / nl;
        }
        return { positions: out, normals: nrm };
      };

      let basePositions: Float32Array | null = null;
      let scattered: Float32Array | null = null;
      let introActive = false, introT = 0;

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
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

          const { positions: arr, normals: nrm } = samplePoints(meshes, 90000);
          basePositions = arr;                
          const drawArr = arr.slice();        
          
          const seeds = new Float32Array(arr.length / 3);
          for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random() * Math.PI * 2;
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(drawArr, 3));
          geo.setAttribute('aNormal', new THREE.BufferAttribute(nrm, 3));
          geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
          
          const mat = new THREE.ShaderMaterial({
            uniforms: {
              uSize: { value: 0.009 },
              uScale: { value: renderer.domElement.height * 0.5 },
              uMap: { value: sprite },
              uColor: { value: new THREE.Color(0xffffff) },
              uTime: { value: 0 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexShader: `
              uniform float uSize;
              uniform float uScale;
              uniform float uTime;
              attribute float aSeed;
              varying float vTw;
              void main() {
                vTw = 0.65 + 0.35 * sin(uTime * 2.2 + aSeed);
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = uSize * (uScale / -mv.z) * (0.85 + 0.3 * vTw);
                gl_Position = projectionMatrix * mv;
              }
            `,
            fragmentShader: `
              uniform sampler2D uMap;
              uniform vec3 uColor;
              varying float vTw;
              void main() {
                vec4 tex = texture2D(uMap, gl_PointCoord);
                if (tex.a < 0.02) discard;
                gl_FragColor = vec4(uColor, tex.a * vTw);
              }
            `,
          });
          points = new THREE.Points(geo, mat);
          scene.add(points);

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
          cloudShownAt = performance.now();

          // <-- Only load the high-res mesh if we haven't disabled it via props
          if (!disableHiRes) {
            hiLoading = true;
            hiProgress = 0;
            let phraseIdx = 0;
            hiPhrase = hiPhrases[0];
            phraseTimer = setInterval(() => {
              phraseIdx = (phraseIdx + 1) % hiPhrases.length;
              hiPhrase = hiPhrases[phraseIdx];
            }, 2200);
            loader.load(
              hiSrc,
              (hi: any) => {
                if (disposed) return;
                const root = hi.scene;
                const hbox = new THREE.Box3().setFromObject(root);
                const hsize = hbox.getSize(new THREE.Vector3());
                const hcenter = hbox.getCenter(new THREE.Vector3());
                root.position.sub(hcenter);
                root.scale.setScalar(2.4 / Math.max(hsize.x, hsize.y, hsize.z));

                const swap = () => {
                  if (disposed) return;
                  const group = new THREE.Group();
                  group.add(root);
                  if (points) { group.rotation.y = points.rotation.y; group.position.y = points.position.y; }
                  scene.add(group);
                  actual = group;

                  if (points) {
                    scene.remove(points);
                    points.geometry.dispose();
                    points.material.dispose();
                    points = null;
                  }
                  introActive = false;
                  hiLoading = false;
                  clearInterval(phraseTimer);
                };

                const remaining = MIN_CLOUD_MS - (performance.now() - cloudShownAt);
                if (remaining > 0) swapTimer = setTimeout(swap, remaining);
                else swap();
              },
              (e: any) => {
                if (e.lengthComputable) hiProgress = Math.min(100, Math.round((e.loaded / e.total) * 100));
              },
              () => {
                hiLoading = false;
                clearInterval(phraseTimer);
              }
            );
          }
        },
        (e: any) => {
          if (e.lengthComputable) {
            progress = Math.min(100, Math.round((e.loaded / e.total) * 100));
            status = `loading ${progress}%`;
          }
        },
        () => { status = 'load failed'; }
      );

      const clock = new THREE.Clock();
      let t = 0;
      const tick = () => {
        const dt = Math.min(clock.getDelta(), 1 / 30);
        t += dt;
        if (introActive && points && scattered && basePositions) {
          introT = Math.min(1, introT + dt * 0.6);
          const e = 1 - Math.pow(1 - introT, 3);
          const arr = points.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < arr.length; i++) arr[i] = scattered[i] + (basePositions[i] - scattered[i]) * e;
          points.geometry.attributes.position.needsUpdate = true;
          if (introT >= 1) introActive = false;
        }
        if (points) {
          points.material.uniforms.uTime.value = t;
          points.material.uniforms.uSize.value = 0.009 + Math.sin(t * 1.5) * 0.001;
        }
        
        const obj = points ?? actual;
        if (obj) {
          const targetRotY = scrollProgress * Math.PI * 2.4 + t * 0.05;
          obj.rotation.y += (targetRotY - obj.rotation.y) * 0.06;
          const targetRotX = (scrollProgress - 0.5) * 0.5;
          obj.rotation.x += (targetRotX - obj.rotation.x) * 0.05;
          obj.position.y += ((Math.sin(t * 0.5) * 0.03 - scrollProgress * 0.25) - obj.position.y) * 0.06;
        }
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanupResize = (() => {
        const prev = cleanupResize;
        return () => {
          prev?.();
          window.removeEventListener('scroll', onScroll);
          clearTimeout(swapTimer);
          clearInterval(phraseTimer);
          cancelAnimationFrame(raf);
          envTexture.dispose();
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

<!-- Rest of markup and styles remain identical -->
<div class="cloud" bind:this={wrap}>
  <canvas bind:this={canvas}></canvas>
  {#if !ready}
    <div class="overlay">
      <div class="spinner"></div>
      <span>{status}</span>
    </div>
  {/if}
  {#if hiLoading}
    <div class="hi-loader">
      <div class="hi-spinner"></div>
      {#key hiPhrase}
        <span class="hi-text">{hiPhrase}{hiProgress > 0 ? ` ${hiProgress}%` : ''}</span>
      {/key}
    </div>
  {/if}
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

  .hi-loader {
    position: absolute;
    left: 50%; bottom: 16px;
    transform: translateX(-50%);
    display: flex; align-items: center; gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(10, 12, 20, 0.55);
    border: 1px solid var(--line-strong);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    color: var(--fg-mute); font-family: var(--mono); font-size: 11px;
    white-space: nowrap;
    pointer-events: none;
    animation: rise-in 0.4s ease;
  }
  .hi-spinner {
    width: 12px; height: 12px; flex-shrink: 0;
    border: 1.5px solid var(--line-strong); border-top-color: var(--azure);
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  .hi-text { animation: phrase-in 0.35s ease; }
  @keyframes rise-in {
    from { opacity: 0; transform: translate(-50%, 8px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes phrase-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>