<script lang="ts">
  import { onMount } from 'svelte';

  let { onDone }: { onDone: () => void } = $props();

  const lines: { html: string; d: number }[] = [
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> mounted /dev/portfolio', d: 80 },
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> reached target <span class="amber">network-online</span>', d: 50 },
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> started <span class="amber">thath-sh</span> 1.4', d: 50 },
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> loaded <span class="amber">guardduty-agent</span> · <span class="amber">cloudtrail-tail</span> · <span class="amber">drift-watch</span>', d: 90 },
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> attached pager · on-call rotation primary', d: 60 },
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> warmed up models · 47/47 healthy', d: 50 },
    { html: '<span class="dim">[</span><span class="amber"> WARN </span><span class="dim">]</span> coffee daemon stale — brewing v60 in background', d: 60 },
    { html: '<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> ready. <span class="amber">welcome.</span>', d: 200 },
  ];

  let shown = $state<string[]>([]);

  onMount(() => {
    let cancelled = false;
    let i = 0;
    const next = () => {
      if (cancelled) return;
      if (i >= lines.length) { setTimeout(onDone, 300); return; }
      const cur = lines[i];
      shown = [...shown, cur.html];
      i++;
      setTimeout(next, cur.d);
    };
    next();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDone(); };
    window.addEventListener('keydown', onKey);
    return () => { cancelled = true; window.removeEventListener('keydown', onKey); };
  });
</script>

<div class="boot">
  <div class="logo">thathsara.dev — boot v1.4 · {new Date().toLocaleString('en-GB')}</div>
  {#each shown as html}
    <div class="line">{@html html}</div>
  {/each}
  <button class="skip" onclick={onDone}>skip · [esc]</button>
</div>

<style>
  .skip { background: none; border: 1px solid var(--line); color: var(--fg-mute); font: inherit; cursor: pointer; }
</style>
