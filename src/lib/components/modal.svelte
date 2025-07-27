<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    type = "Normal",
    children,
    showModal = $bindable(),
  }: {
    type?: string;
    children: Snippet;
    showModal: boolean;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (dialog && showModal) dialog.showModal();
  });
</script>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <dialog
    class="Modal"
    bind:this={dialog}
    onclose={() => (showModal = false)}
    onclick={(e) => {
      if (e.target === dialog) dialog.close();
    }}
  >
    <div class="Modal__content" data-type={type}>
      {@render children?.()}
    </div>
  </dialog>
{/if}

<style lang="scss">
  .Modal {
    position: fixed;
    @include box(100vw, 100vh);
    @include make-flex();
    // max-width: 32em;
    background: transparent;
    border: none;
    padding: 0;

    &::backdrop {
      background: rgba(0, 0, 0, 0.3);
    }

    &:-internal-dialog-in-top-layer {
      max-width: unset;
      max-height: unset;
    }

    &__content {
      display: none;
      border-radius: 15px;
      background-color: transparent;
      @include box(min(80vw, 80vh), 530px);
    }

    &[open] {
      animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &[open] > &__content {
      display: flex;
    }
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
