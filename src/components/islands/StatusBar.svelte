<script lang="ts">
  import { onMount } from 'svelte';
  import { workspace, theme, cmdBus, pushToast, snakeOpen } from '../../lib/store';
  import { workspaces } from '../../lib/data';

  let time = $state(new Date());
  let brandClicks = $state(0);

  onMount(() => {
    const id = setInterval(() => { time = new Date(); }, 1000);
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && /^[1-8]$/.test(e.key)) {
        const w = workspaces[parseInt(e.key, 10) - 1];
        if (w) workspace.set(w.id);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(id); window.removeEventListener('keydown', onKey); };
  });

  function clickBrand() {
    brandClicks++;
    if (brandClicks === 7) {
      snakeOpen.set(true);
      pushToast('hidden interaction', 'you clicked the brand 7 times. here, have a snake.');
      brandClicks = 0;
    } else if (brandClicks === 3) {
      pushToast('keep going…', '4 more clicks for something stupid.');
    }
  }
</script>

<div class="statusbar">
  <div class="sb-cell brand" onclick={clickBrand} role="button" tabindex="0" title="brand">
    <span class="dot"></span>thathsara.dev
  </div>
  <div class="sb-tabs">
    {#each workspaces as w}
      <button
        class="sb-tab"
        class:active={$workspace === w.id}
        onclick={() => workspace.set(w.id)}
      >
        <span class="num">{w.num}</span>
        <span class="lbl">{w.label}</span>
      </button>
    {/each}
  </div>
  <div class="sb-right">
    <div class="sb-cell" title="model training">
      <span style="color: var(--mint)">●</span> train · ok
    </div>
    <div class="sb-cell" title="cloud security posture">
      <span style={`color: ${$theme === 'red-team' ? 'var(--coral)' : 'var(--amber)'}`}>●</span>
      threat · {$theme === 'red-team' ? 'ELEV' : 'NOMINAL'}
    </div>
    <div class="sb-cell" title="time">
      {time.toLocaleTimeString('en-GB', { hour12: false })}
    </div>
  </div>
</div>

<style>
  .sb-tab { background: none; border: none; font: inherit; cursor: pointer; }
  .sb-tab { display: flex; align-items: center; gap: 6px; padding: 0 12px; border-right: 1px solid var(--line); color: var(--fg-mute); transition: color 120ms, background 120ms; white-space: nowrap; height: 100%; }
  .sb-tab:hover { color: var(--fg); background: var(--bg-2); }
  .sb-tab.active { color: var(--bg-0); background: var(--amber); font-weight: 600; }
  .sb-tab .num { opacity: 0.55; font-size: 10px; }
  .sb-tab.active .num { opacity: 0.7; }
</style>
