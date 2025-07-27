<svelte:options runes={true} />

<script lang="ts">
  import Spinner from "./Spinner.svelte";

  const { zIndex = 10 } = $props();
</script>

<div class="BlurredSpinner" style="z-index: {zIndex}">
  <Spinner />
</div>

<style lang="scss">
  .BlurredSpinner {
    top: 0;
    left: 0;
    gap: 8px;
    @include box();
    position: absolute;
    @include make-flex();
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.49);
    backdrop-filter: blur(15px);
  }
</style>
