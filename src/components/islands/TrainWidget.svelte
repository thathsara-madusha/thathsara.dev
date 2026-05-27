<script lang="ts">
  import { onMount } from 'svelte';

  type Pt = { l: number; v: number };

  let step = $state(142);
  let history = $state<Pt[]>(seed());

  function seed(): Pt[] {
    const h: Pt[] = [];
    let l = 2.8, v = 2.9;
    for (let i = 0; i < 60; i++) {
      l = Math.max(0.04, l * 0.96 + (Math.random() - 0.5) * 0.08);
      v = Math.max(0.06, v * 0.962 + (Math.random() - 0.5) * 0.09);
      h.push({ l, v });
    }
    return h;
  }

  onMount(() => {
    const id = setInterval(() => {
      step++;
      const last = history[history.length - 1];
      const l = Math.max(0.035, last.l * (0.998 + (Math.random() - 0.5) * 0.02));
      const v = Math.max(0.05,  last.v * (0.999 + (Math.random() - 0.5) * 0.025));
      history = [...history.slice(1), { l, v }];
    }, 1200);
    return () => clearInterval(id);
  });

  const W = 280, H = 80, PAD = 2;
  const max = $derived(Math.max(...history.map(p => p.v)) * 1.05);
  const x = (i: number) => PAD + (i / (history.length - 1)) * (W - PAD * 2);
  const y = (val: number) => PAD + (1 - val / max) * (H - PAD * 2);
  const train = $derived(history.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.l).toFixed(1)}`).join(' '));
  const val   = $derived(history.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' '));
  const cur = $derived(history[history.length - 1]);
</script>

<div class="widget train-widget">
  <h3 class="widget-title">
    <span>// training run</span>
    <span class="right">shadow-rbac · {step}/14000</span>
  </h3>
  <div class="plot">
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={train} fill="none" stroke="var(--mint)" stroke-width="1.2" />
      <path d={val}   fill="none" stroke="var(--amber)" stroke-width="1.2" stroke-dasharray="3 2" />
    </svg>
  </div>
  <div class="legend">
    <span><i class="d" style="background: var(--mint)"></i>train {cur.l.toFixed(3)}</span>
    <span><i class="d" style="background: var(--amber)"></i>val {cur.v.toFixed(3)}</span>
  </div>
</div>
