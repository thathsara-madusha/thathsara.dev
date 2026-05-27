<script lang="ts">
  import { onMount } from 'svelte';
  import Boot from './Boot.svelte';

  let booting = $state(true);

  onMount(() => {
    // Persist a "seen boot" flag for the session so reloads don't always replay it.
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem('booted') === '1') booting = false;
    }
  });

  function done() {
    booting = false;
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('booted', '1');
  }
</script>

{#if booting}
  <Boot onDone={done} />
{/if}
