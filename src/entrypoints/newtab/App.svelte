<svelte:options runes={true} />

<script lang="ts">
  import settingStore from "../../lib/stores/settingStore";

  settingStore.subscribe((value) => {
    document.body.style.backgroundImage = `url(${value.options.wallpaper})`;
  });
</script>

hello there $$render
