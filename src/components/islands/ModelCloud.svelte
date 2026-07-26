<script lang="ts">
  let {
    src = '/me.glb',
    hiSrc = '/fixed.glb',
    lockLook = false,
    shiftX = 0,
    disableHiRes = false,
  }: { 
    src?: string; 
    hiSrc?: string; 
    lockLook?: boolean; 
    shiftX?: number;
    disableHiRes?: boolean;
  } = $props();

  let canvas = $state<HTMLCanvasElement | undefined>(undefined);
  let wrap = $state<HTMLDivElement | undefined>(undefined);
  let status = $state('loading…');
  let progress = $state(0);
  let ready = $state(false);
  let hiLoading = $state(false);
  let hiPhrase = $state('');
  let hiProgress = $state(0);

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
    let disposed = false;
    let animationFrameId = 0;
    let cleanupEvents = () => {};
    let disposeRenderer = () => {};
    let cancelModelSwap = () => {};
    const abortController = new AbortController();
    
    // Shared state for the animation loop
    const sceneState: any = {
      points: null,
      actual: null,
      basePositions: null,
      scattered: null,
      introActive: false,
      introT: 0,
      scrollProgress: 0,
      pointerX: 0,
      pointerY: 0,
      pointerTargetX: 0,
      pointerTargetY: 0,
      pointerActive: 0,
      pointerTargetActive: 0,
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };

    (async () => {
      // 1. Load Dependencies
      const deps = await loadDependencies();
      if (disposed) return;

      // 2. Setup Core Scene
      const { renderer, scene, camera, controls } = setupScene(deps, canvas, shiftX, lockLook);
      disposeRenderer = () => renderer.dispose();
      setupLightingAndEnvironment(deps, scene, renderer);
      
      // 3. Setup Events (Resize & Scroll)
      cleanupEvents = setupEventListeners(wrap, renderer, camera, sceneState);

      // 4. Prepare Loaders & Materials
      const spriteTexture = createParticleSprite(deps.THREE);
      const loader = createModelLoader(deps);
      
      // 5. Load Low-Res Model & Create Point Cloud
      try {
        const gltf = await loadModel(loader, src, (p) => {
          progress = p;
          status = `loading ${p}%`;
        });
        
        if (disposed) return;
        
        const cloudData = createPointCloud(deps.THREE, gltf.scene, spriteTexture, renderer.domElement.height);
        sceneState.points = cloudData.points;
        sceneState.basePositions = cloudData.basePositions;
        sceneState.scattered = cloudData.scattered;
        sceneState.introActive = true;
        scene.add(sceneState.points);

        status = 'ready';
        ready = true;
        const cloudShownAt = performance.now();


        // 6. Start Animation Loop using the core THREE.Timer
        const timer = new deps.THREE.Timer();
        let time = 0;
        
        // requestAnimationFrame automatically passes a high-res timestamp here
        const tick = (timestamp = 0) => {
          if (disposed) return; // Prevent ghost loops
          
          // Update the timer with the current timestamp
          timer.update(timestamp);
          
          // Get the delta (capping at 1/30th of a second prevents huge jumps if the user switches tabs)
          const dt = Math.min(timer.getDelta(), 1 / 30);
          time += dt;
          
          updateAnimation(deps.THREE, sceneState, time, dt, controls);
          renderer.render(scene, camera);
          
          animationFrameId = requestAnimationFrame(tick);
        };
        
        // Kick off the loop using rAF instead of calling tick() directly
        animationFrameId = requestAnimationFrame(tick);

        // 7. Progressively Load High-Res Model (Optional)
        if (!disableHiRes && shouldLoadHighRes()) {
          await waitForHighResOpportunity(abortController.signal);

          if (!disposed) {
            const phraseTimer = startHighResPhrases();

            try {
              const hiResGltf = await loadModel(loader, hiSrc, (p) => {
                hiProgress = p;
              });

              if (!disposed) {
                cancelModelSwap = scheduleModelSwap(deps.THREE, scene, sceneState, hiResGltf.scene, cloudShownAt, () => {
                  hiLoading = false;
                  clearInterval(phraseTimer);
                });
              } else {
                clearInterval(phraseTimer);
              }
            } catch {
              hiLoading = false;
              clearInterval(phraseTimer);
            }
          }
        }
      } catch (err) {
        if (!disposed) status = 'load failed';
      }
    })();

    return () => {
      disposed = true;
      abortController.abort();
      cancelAnimationFrame(animationFrameId);
      cancelModelSwap();
      cleanupEvents();
      disposeRenderer();
    };
  });

  // --- HELPER FUNCTIONS ---

  function shouldLoadHighRes() {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    if (connection?.saveData) return false;
    return !['slow-2g', '2g'].includes(connection?.effectiveType ?? '');
  }

  function waitForHighResOpportunity(signal: AbortSignal) {
    return new Promise<void>((resolve) => {
      let idleId: number | undefined;
      let fallbackId: ReturnType<typeof setTimeout> | undefined;

      const cancelIdleWait = () => {
        if (idleId !== undefined && 'cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleId);
          idleId = undefined;
        }
        if (fallbackId !== undefined) {
          clearTimeout(fallbackId);
          fallbackId = undefined;
        }
      };

      const cleanup = () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        cancelIdleWait();
        signal.removeEventListener('abort', onAbort);
      };

      const finish = () => {
        if (document.visibilityState !== 'visible') {
          cancelIdleWait();
          return;
        }
        cleanup();
        resolve();
      };

      const waitForIdle = () => {
        if (idleId !== undefined || fallbackId !== undefined) return;
        if ('requestIdleCallback' in window) {
          idleId = window.requestIdleCallback(finish, { timeout: 10000 });
        } else {
          fallbackId = setTimeout(finish, 4000);
        }
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          waitForIdle();
        } else {
          cancelIdleWait();
        }
      };

      const onAbort = () => {
        cleanup();
        resolve();
      };

      signal.addEventListener('abort', onAbort, { once: true });
      document.addEventListener('visibilitychange', onVisibilityChange);
      if (document.visibilityState === 'visible') {
        waitForIdle();
      }
    });
  }

  async function loadDependencies() {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
    return { THREE, GLTFLoader, MeshoptDecoder, OrbitControls, RoomEnvironment };
  }

  function setupScene(deps: any, canvas: HTMLCanvasElement, shiftX: number, lockLook: boolean) {
    const { THREE, OrbitControls } = deps;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    
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

    return { renderer, scene, camera, controls };
  }

  function setupLightingAndEnvironment(deps: any, scene: any, renderer: any) {
    const { THREE, RoomEnvironment } = deps;
    const keyLight = new THREE.DirectionalLight(0x7aa2f7, 3.0);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);
    
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.5;
    pmrem.dispose(); 
  }

  function setupEventListeners(wrap: HTMLDivElement, renderer: any, camera: any, sceneState: any) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      sceneState.scrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (sceneState.reduceMotion || event.pointerType === 'touch') return;
      sceneState.pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerTargetY = 1 - (event.clientY / window.innerHeight) * 2;
      sceneState.pointerTargetActive = 1;
    };

    const onPointerLeave = () => {
      sceneState.pointerTargetActive = 0;
    };
    
    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (sceneState.points) {
        sceneState.points.material.uniforms.uScale.value = renderer.domElement.height * 0.5;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    
    onScroll();
    resize();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }

  function createParticleSprite(THREE: any) {
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
    return sprite;
  }

  function createModelLoader(deps: any) {
    const loader = new deps.GLTFLoader();
    loader.setMeshoptDecoder(deps.MeshoptDecoder);
    return loader;
  }

  function loadModel(loader: any, url: string, onProgress: (p: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        resolve,
        (e: any) => {
          if (e.lengthComputable) {
            onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
          }
        },
        reject
      );
    });
  }

  function createPointCloud(THREE: any, root: any, spriteTexture: any, rendererHeight: number) {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 2.4 / Math.max(size.x, size.y, size.z);
    
    root.position.sub(center);
    root.scale.setScalar(scale);
    root.updateWorldMatrix(true, true);

    const meshes: any[] = [];
    root.traverse((o: any) => { if (o.isMesh && o.geometry) meshes.push(o); });

    const { positions: arr, normals: nrm } = samplePointsFromMeshes(THREE, meshes, 90000);
    const basePositions = arr;                
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
        uScale: { value: rendererHeight * 0.5 },
        uMap: { value: spriteTexture },
        uColor: { value: new THREE.Color(0xffffff) },
        uAccent: { value: new THREE.Color(0xe8b34a) },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uHover: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: `
        uniform float uSize;
        uniform float uScale;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uHover;
        attribute float aSeed;
        attribute vec3 aNormal;
        varying float vTw;
        varying float vHover;
        void main() {
          vTw = 0.65 + 0.35 * sin(uTime * 2.2 + aSeed);
          vec4 baseMv = modelViewMatrix * vec4(position, 1.0);
          vec4 baseClip = projectionMatrix * baseMv;
          vec2 screenPosition = baseClip.xy / baseClip.w;
          float cursorDistance = distance(screenPosition, uPointer);
          vHover = smoothstep(0.34, 0.0, cursorDistance) * uHover;

          float ripple = sin(cursorDistance * 42.0 - uTime * 7.0 + aSeed * 0.35);
          vec3 displaced = position + aNormal * vHover * (0.035 + ripple * 0.018);
          vec4 mv = modelViewMatrix * vec4(displaced, 1.0);

          gl_PointSize = uSize * (uScale / -mv.z)
            * (0.85 + 0.3 * vTw + vHover * 0.75);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        varying float vTw;
        varying float vHover;
        void main() {
          vec4 tex = texture2D(uMap, gl_PointCoord);
          if (tex.a < 0.02) discard;
          vec3 color = mix(uColor, uAccent, vHover * 0.8);
          gl_FragColor = vec4(color, tex.a * (vTw + vHover * 0.25));
        }
      `,
    });
    
    const points = new THREE.Points(geo, mat);

    // Scatter points for intro animation
    const scattered = new Float32Array(arr.length);
    const dir = new THREE.Vector3();
    for (let i = 0; i < arr.length; i += 3) {
      dir.set(arr[i], arr[i + 1], arr[i + 2]).normalize();
      const rr = 2.2 + Math.random() * 1.5;
      scattered[i] = dir.x * rr + (Math.random() - 0.5);
      scattered[i + 1] = dir.y * rr + (Math.random() - 0.5);
      scattered[i + 2] = dir.z * rr + (Math.random() - 0.5);
    }

    return { points, basePositions, scattered };
  }

  function samplePointsFromMeshes(THREE: any, meshes: any[], targetCount: number) {
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
  }

  function startHighResPhrases() {
    hiLoading = true;
    hiProgress = 0;
    let phraseIdx = 0;
    hiPhrase = hiPhrases[0];
    return setInterval(() => {
      phraseIdx = (phraseIdx + 1) % hiPhrases.length;
      hiPhrase = hiPhrases[phraseIdx];
    }, 2200);
  }

  function scheduleModelSwap(THREE: any, scene: any, sceneState: any, hiResRoot: any, cloudShownAt: number, onComplete: () => void) {
    const MIN_CLOUD_MS = 5000;
    
    // Scale and center high-res model
    const hbox = new THREE.Box3().setFromObject(hiResRoot);
    const hsize = hbox.getSize(new THREE.Vector3());
    const hcenter = hbox.getCenter(new THREE.Vector3());
    hiResRoot.position.sub(hcenter);
    hiResRoot.scale.setScalar(2.4 / Math.max(hsize.x, hsize.y, hsize.z));

    const swap = () => {
      const group = new THREE.Group();
      group.add(hiResRoot);
      
      if (sceneState.points) { 
        group.rotation.y = sceneState.points.rotation.y; 
        group.position.y = sceneState.points.position.y; 
      }
      
      scene.add(group);
      sceneState.actual = group;

      if (sceneState.points) {
        scene.remove(sceneState.points);
        sceneState.points.geometry.dispose();
        sceneState.points.material.dispose();
        sceneState.points = null;
      }
      
      sceneState.introActive = false;
      onComplete();
    };

    const remaining = MIN_CLOUD_MS - (performance.now() - cloudShownAt);
    if (remaining > 0) {
      const timeoutId = setTimeout(swap, remaining);
      return () => clearTimeout(timeoutId);
    } else {
      swap();
      return () => {};
    }
  }

  function updateAnimation(THREE: any, state: any, time: number, dt: number, controls: any) {
    const pointerEase = 1 - Math.exp(-dt * 10);
    state.pointerX += (state.pointerTargetX - state.pointerX) * pointerEase;
    state.pointerY += (state.pointerTargetY - state.pointerY) * pointerEase;
    state.pointerActive += (state.pointerTargetActive - state.pointerActive) * pointerEase;

    // Intro scatter animation
    if (state.introActive && state.points && state.scattered && state.basePositions) {
      state.introT = Math.min(1, state.introT + dt * 0.6);
      const e = 1 - Math.pow(1 - state.introT, 3);
      const arr = state.points.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        arr[i] = state.scattered[i] + (state.basePositions[i] - state.scattered[i]) * e;
      }
      state.points.geometry.attributes.position.needsUpdate = true;
      if (state.introT >= 1) state.introActive = false;
    }
    
    // Shader updates
    if (state.points) {
      state.points.material.uniforms.uTime.value = time;
      state.points.material.uniforms.uSize.value = 0.009 + Math.sin(time * 1.5) * 0.001;
      state.points.material.uniforms.uPointer.value.set(state.pointerX, state.pointerY);
      state.points.material.uniforms.uHover.value = state.pointerActive;
    }
    
    // Global rotation and float based on scroll
    const activeObject = state.points ?? state.actual;
    if (activeObject) {
      const pointerRotY = state.pointerX * state.pointerActive * 0.12;
      const pointerRotX = -state.pointerY * state.pointerActive * 0.07;
      const targetRotY = state.scrollProgress * Math.PI * 2.4 + time * 0.05 + pointerRotY;
      activeObject.rotation.y += (targetRotY - activeObject.rotation.y) * 0.06;
      
      const targetRotX = (state.scrollProgress - 0.5) * 0.5 + pointerRotX;
      activeObject.rotation.x += (targetRotX - activeObject.rotation.x) * 0.05;
      
      const targetY = (Math.sin(time * 0.5) * 0.03 - state.scrollProgress * 0.25);
      activeObject.position.y += (targetY - activeObject.position.y) * 0.06;
    }
    
    controls.update();
  }
</script>

<!-- The markup and styles remain identical to your original code -->

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
