<script lang="ts">
  // Mount-once side effects: konami listener (red-team mode), and a hint toast on first load.
  import { onMount } from 'svelte';
  import { setupKonami } from '../../lib/konami';
  import { cmdBus, pushToast } from '../../lib/store';

  onMount(() => {
    const tearDown = setupKonami(() => {
      cmdBus.setTheme('red-team');
      pushToast('konami unlocked', 'RED TEAM mode engaged. theme amber → coral. find the rest of the easter eggs to escape.');
    });
    return tearDown;
  });
</script>
