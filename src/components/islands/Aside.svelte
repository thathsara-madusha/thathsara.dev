<script lang="ts">
  import SystemWidget from './SystemWidget.svelte';
  import TrainWidget from './TrainWidget.svelte';
  import ThreatMap from './ThreatMap.svelte';
  import NowPlaying from './NowPlaying.svelte';
</script>

<aside class="aside">
  <SystemWidget />
  <TrainWidget />
  <ThreatMap />
  <NowPlaying />

  <div class="widget">
    <h3 class="widget-title"><span>// keys</span><span class="right">help</span></h3>
    <div style="font-size: 10.5px; color: var(--fg-mute); line-height: 1.7;">
      <div><span style="color: var(--mint)">alt-1…8</span> &nbsp;switch workspace</div>
      <div><span style="color: var(--mint)">tab</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;complete cmd</div>
      <div><span style="color: var(--mint)">ctrl-l</span> &nbsp;&nbsp;&nbsp;clear terminal</div>
      <div><span style="color: var(--mint)">ctrl-m</span> &nbsp;&nbsp;&nbsp;maximize terminal</div>
      <div><span style="color: var(--mint)">esc</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;exit overlay</div>
      <div style="margin-top: 6px; color: var(--fg-faint);">· try `help`, `secrets`, `whoami`, or the konami code.</div>
    </div>
  </div>
</aside>
