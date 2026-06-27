<script lang="ts">
  // Self-contained modal: compose a trigger and a body inside one <Modal>, the
  // way a shadcn Dialog wraps Trigger + Content. Open state lives here — nothing
  // external to wire up.
  //
  //   <Modal ariaLabel="gotcha">
  //     <button slot="trigger" class="btn">open</button>
  //     <p>…body…</p>
  //     <button data-modal-close>done</button>
  //   </Modal>
  //
  // The trigger opens on click; the ×, the backdrop, Escape, or any element
  // marked `data-modal-close` dismisses it.
  import type { Snippet } from "svelte";

  let {
    ariaLabel = "dialog",
    cardClass = "",
    trigger,
    children,
  }: {
    ariaLabel?: string;
    cardClass?: string;
    trigger?: Snippet;
    children?: Snippet;
  } = $props();

  let open = $state(false);
  const close = () => (open = false);

  // The trigger snippet supplies its own interactive element (a real button), so
  // we catch its bubbled click here rather than making the wrapper clickable —
  // keyboard activation comes for free from the child button.
  let triggerWrap: HTMLSpanElement | undefined = $state();
  $effect(() => {
    const el = triggerWrap;
    if (!el) return;
    const onClick = () => (open = true);
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  });

  $effect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
</script>

<span class="modal-trigger" bind:this={triggerWrap}>
  {@render trigger?.()}
</span>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="modal"
  class:open
  aria-hidden={!open}
  onclick={(e) => {
    if (e.target === e.currentTarget) close();
    else if ((e.target as HTMLElement).closest("[data-modal-close]")) close();
  }}
>
  <div class="modal-card {cardClass}" role="dialog" aria-modal="true" aria-label={ariaLabel}>
    <button class="modal-close" type="button" aria-label="close" onclick={close}
      >×</button
    >
    {@render children?.()}
  </div>
</div>

<style>
  /* keep the trigger transparent to layout so it sits inline with siblings */
  .modal-trigger {
    display: contents;
  }
  .modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: color-mix(in srgb, var(--bg-0) 78%, transparent);
    backdrop-filter: blur(8px);
  }
  .modal.open {
    display: flex;
    animation: fade 180ms ease;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .modal-card {
    position: relative;
    max-width: 420px;
    width: 100%;
    border: 1px solid var(--line-strong);
    background: var(--bg-1);
    border-radius: 8px;
    padding: 32px 28px 28px;
    text-align: center;
    animation: pop 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
  }
  @keyframes pop {
    from {
      transform: scale(0.92);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  .modal-close {
    position: absolute;
    top: 10px;
    right: 14px;
    background: none;
    border: none;
    color: var(--fg-mute);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    transition: color 140ms;
  }
  .modal-close:hover {
    color: var(--fg);
  }
</style>
