<script lang="ts">
  import { onMount } from 'svelte';

  type Identity = { location: string; timezone: string; uptime: string };
  let { identity }: { identity: Identity } = $props();
  let time = $state(new Date());

  onMount(() => {
    const id = setInterval(() => { time = new Date(); }, 1000);
    return () => clearInterval(id);
  });
</script>

<div class="hero-id">
  <span class="stat">online</span>
  <span class="sep">·</span>
  <span>{identity.location}</span>
  <span class="sep">·</span>
  <span>{time.toLocaleTimeString('en-GB', { hour12: false })} {identity.timezone}</span>
  <span class="sep">·</span>
  <span>uptime {identity.uptime}</span>
</div>
