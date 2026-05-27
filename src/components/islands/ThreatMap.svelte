<script lang="ts">
  import { onMount } from 'svelte';

  type City = { n: string; x: number; y: number };
  const CITIES: City[] = [
    { n: 'sin', x: 590, y: 248 }, { n: 'col', x: 555, y: 235 },
    { n: 'fra', x: 410, y: 145 }, { n: 'nyc', x: 215, y: 155 },
    { n: 'sfo', x: 110, y: 165 }, { n: 'msk', x: 460, y: 120 },
    { n: 'sao', x: 290, y: 290 }, { n: 'syd', x: 700, y: 320 },
    { n: 'tyo', x: 690, y: 170 }, { n: 'lon', x: 395, y: 138 },
    { n: 'jhb', x: 460, y: 290 }, { n: 'mum', x: 555, y: 215 },
    { n: 'kie', x: 460, y: 138 }, { n: 'bei', x: 660, y: 175 },
  ];
  const TARGETS = ['sin', 'col', 'fra', 'nyc'];
  const SEV: Record<string, string> = { LO: 'var(--mint)', MD: 'var(--amber)', HI: 'var(--coral)' };

  // Land-mass dot silhouette (seeded so SSR/CSR don't fight; only mounts client-side anyway)
  const land = (() => {
    const out: [number, number][] = [];
    const regions: [number, number, number, number, number][] = [
      [80, 200, 110, 260, 0.12],
      [240, 320, 230, 320, 0.13],
      [380, 470, 110, 240, 0.13],
      [400, 510, 240, 320, 0.10],
      [490, 720, 140, 240, 0.10],
      [680, 730, 300, 340, 0.10],
    ];
    let rng = 1;
    const rand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
    regions.forEach(([x0, x1, y0, y1, d]) => {
      const n = Math.floor((x1 - x0) * (y1 - y0) * d * 0.018);
      for (let i = 0; i < n; i++) out.push([x0 + rand() * (x1 - x0), y0 + rand() * (y1 - y0)]);
    });
    return out;
  })();

  function arcPath(x1: number, y1: number, x2: number, y2: number) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const cx = mx - dy / len * len * 0.25;
    const cy = my + dx / len * len * 0.25 - len * 0.25;
    return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
  }

  type Attack = { id: number; src: City; dst: City; sev: keyof typeof SEV };
  type LogRow = { id: number; t: string; ip: string; dst: string; sev: keyof typeof SEV; verb: string };

  let attacks = $state<Attack[]>([]);
  let log = $state<LogRow[]>([]);
  let counter = 0;

  onMount(() => {
    const tick = () => {
      const srcs = CITIES.filter(c => !TARGETS.includes(c.n));
      const dsts = CITIES.filter(c => TARGETS.includes(c.n));
      const src = srcs[Math.floor(Math.random() * srcs.length)];
      const dst = dsts[Math.floor(Math.random() * dsts.length)];
      const sev = Math.random() < 0.7 ? 'LO' : Math.random() < 0.8 ? 'MD' : 'HI';
      const id = ++counter;
      const ip = `${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
      const verb = ['SCAN', 'PROBE', 'AUTH', 'POST', 'INJECT', 'RECON', 'SSRF'][Math.floor(Math.random() * 7)];
      attacks = [...attacks, { id, src, dst, sev }].slice(-12);
      log = [{ id, ip, dst: dst.n, sev, verb, t: new Date().toLocaleTimeString('en-GB', { hour12: false }) }, ...log].slice(0, 14);
      setTimeout(() => { attacks = attacks.filter(a => a.id !== id); }, 2400);
    };
    tick();
    const id = setInterval(tick, 1400);
    return () => clearInterval(id);
  });
</script>

<div class="widget">
  <h3 class="widget-title">
    <span>// global threat map</span>
    <span class="right">live · gd+ct</span>
  </h3>
  <div class="threatmap">
    <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
      <g class="land">
        {#each land as [x, y]}<circle cx={x} cy={y} r="1" />{/each}
      </g>
      {#each attacks as a (a.id)}
        <g>
          <path class="arc" d={arcPath(a.src.x, a.src.y, a.dst.x, a.dst.y)} stroke={SEV[a.sev]} style="opacity: 0.7" />
          <circle cx={a.src.x} cy={a.src.y} class="src" fill={SEV[a.sev]} />
          <circle cx={a.dst.x} cy={a.dst.y} class="dst" fill={SEV[a.sev]} />
        </g>
      {/each}
      {#each TARGETS as t}
        {@const c = CITIES.find(x => x.n === t)}
        {#if c}<circle cx={c.x} cy={c.y} r="2" fill="var(--amber)" />{/if}
      {/each}
    </svg>
  </div>
  <div class="threat-log">
    {#each log as l (l.id)}
      <div class="tl-row">
        <span>{l.t}</span>
        <span class={`sev ${l.sev}`}>[{l.sev}]</span>
        <span class="ip">{l.ip}</span>
        <span>→ {l.dst}</span>
        <span style="color: var(--fg-faint)">{l.verb}</span>
      </div>
    {/each}
  </div>
</div>
