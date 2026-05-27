<script lang="ts">
  // Workspace controller. Sets body[data-ws] when the store changes, and intercepts
  // [data-nav] clicks anywhere in the SSR'd page (e.g. quick-nav links in the hero).
  import { onMount } from "svelte";
  import { workspace } from "../../lib/store";
  import type { WorkspaceId } from "../../lib/data";

  onMount(() => {
    const unsub = workspace.subscribe((id) => {
      document.body.setAttribute("data-ws", id);
    });

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-nav]");
      if (!el) return;
      e.preventDefault();
      const target = el.getAttribute("data-nav");
      if (target === "__terminal") {
        const input =
          document.querySelector<HTMLInputElement>(".term-input input");
        input?.focus();
        return;
      }
      if (target) workspace.set(target as WorkspaceId);
    };
    document.addEventListener("click", onClick);

    return () => {
      unsub();
      document.removeEventListener("click", onClick);
    };
  });
</script>
