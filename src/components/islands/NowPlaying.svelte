<script lang="ts">
  import { onMount } from 'svelte';

  const tracks = [
    { t: 'Music for Airports', by: 'Brian Eno', d: '17:21' },
    { t: 'Kankyo Ongaku', by: 'Various — Light in the Attic', d: '08:42' },
    { t: 'Endtroducing\u2026', by: 'DJ Shadow', d: '04:34' },
    { t: 'Selected Ambient Works 85\u201392', by: 'Aphex Twin', d: '05:01' },
    { t: 'In a Silent Way', by: 'Miles Davis', d: '18:00' },
  ];
  let idx = $state(0);
  let t = $state(0);

  const dur = $derived(tracks[idx].d.split(':').reduce((a, b) => +a * 60 + +b, 0));
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  onMount(() => {
    const id = setInterval(() => {
      if (t + 1 >= dur) { idx = (idx + 1) % tracks.length; t = 0; }
      else t = t + 1;
    }, 1000);
    return () => clearInterval(id);
  });
</script>

<div class="widget">
  <h3 class="widget-title">
    <span>// now playing</span>
    <span class="right">~/music</span>
  </h3>
  <div style="font-size: 12px; color: var(--fg); margin-bottom: 2px;">{tracks[idx].t}</div>
  <div style="font-size: 10.5px; color: var(--fg-mute); margin-bottom: 6px;">{tracks[idx].by}</div>
  <div class="bar mint"><i style={`width: ${(t / dur) * 100}%`}></i></div>
  <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--fg-mute);">
    <span>{fmt(t)}</span><span>{tracks[idx].d}</span>
  </div>
</div>
