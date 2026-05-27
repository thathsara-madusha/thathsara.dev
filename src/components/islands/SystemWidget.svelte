<script lang="ts">
  import { onMount } from 'svelte';

  let stats = $state({ cpu: 14, mem: 38, net: 22, gpu: 71, disk: 41 });

  onMount(() => {
    const id = setInterval(() => {
      stats = {
        cpu:  Math.max(4,  Math.min(98, stats.cpu + (Math.random() - 0.5) * 14)),
        mem:  Math.max(20, Math.min(90, stats.mem + (Math.random() - 0.5) * 4)),
        net:  Math.max(0,  Math.min(100, stats.net + (Math.random() - 0.5) * 18)),
        gpu:  Math.max(40, Math.min(99, stats.gpu + (Math.random() - 0.5) * 6)),
        disk: 41,
      };
    }, 1100);
    return () => clearInterval(id);
  });
</script>

<div class="widget">
  <h3 class="widget-title">
    <span>// localhost</span>
    <span class="right">macbook-m3-pro</span>
  </h3>
  <div class="metric-row"><span>cpu</span><b>{Math.round(stats.cpu)}%</b></div>
  <div class="bar"><i style={`width: ${stats.cpu}%`}></i></div>
  <div class="metric-row"><span>mem · 64G</span><b>{Math.round(stats.mem)}%</b></div>
  <div class="bar azure"><i style={`width: ${stats.mem}%`}></i></div>
  <div class="metric-row"><span>gpu · m3max</span><b>{Math.round(stats.gpu)}%</b></div>
  <div class="bar mint"><i style={`width: ${stats.gpu}%`}></i></div>
  <div class="metric-row"><span>net · wg0</span><b>{Math.round(stats.net)}%</b></div>
  <div class="bar amber"><i style={`width: ${stats.net}%`}></i></div>
  <div class="metric-row"><span>disk · enc</span><b>{Math.round(stats.disk)}%</b></div>
  <div class="bar coral"><i style={`width: ${stats.disk}%`}></i></div>
</div>
