<script lang="ts">
  let { cells: realCells = null, weeks = 53 }: { cells?: number[] | null; weeks?: number } = $props();

  const cells = (() => {
    if (realCells && realCells.length > 0) return realCells;
    // fallback: seeded fake data
    const arr: number[] = [];
    let rng = 7;
    const r = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const seasonal = 0.4 + 0.5 * Math.sin((w / weeks) * Math.PI * 2);
        const weekend = d === 0 || d === 6 ? 0.6 : 1.0;
        const x = r() * seasonal * weekend;
        let l = 0;
        if (x > 0.18) l = 1;
        if (x > 0.4)  l = 2;
        if (x > 0.6)  l = 3;
        if (x > 0.78) l = 4;
        arr.push(l);
      }
    }
    return arr;
  })();

  const cols = Math.ceil(cells.length / 7);
</script>

<div class="heatmap-scroll">
<div class="heatmap" style={`grid-template-columns: repeat(${cols}, 11px);`}>
  {#each Array(7) as _, day}
    {#each Array(cols) as _, week}
      {@const l = cells[week * 7 + day] ?? 0}
      <div class={`cell ${l ? 'l' + l : ''}`} style={`grid-column: ${week + 1}; grid-row: ${day + 1};`}></div>
    {/each}
  {/each}
</div>
</div>
