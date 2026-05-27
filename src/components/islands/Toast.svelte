<script lang="ts">
  import { toasts } from '../../lib/store';

  function dismiss(id: string) {
    toasts.update(t => t.filter(x => x.id !== id));
  }
</script>

{#each $toasts as t (t.id)}
  <button class="toast" onclick={() => dismiss(t.id)}>
    <div class="ttl">{t.ttl}</div>
    <div>{t.body}</div>
  </button>
{/each}

<style>
  .toast { background: var(--bg-elev); border: 1px solid var(--amber); color: var(--fg); font: inherit; text-align: left; }
</style>
