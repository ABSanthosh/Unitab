<svelte:options runes={true} />

<script lang="ts">
  import settingStore from "../../lib/stores/settingStore";
  import WidgetGrid from "../../lib/components/WidgetGrid.svelte";
  import FlipClock from "../../lib/components/clock/FlipClock.svelte";

  let widgetGrid: WidgetGrid;

  // Optional: Access grid information
  function getGridInfo() {
    if (widgetGrid) {
      return widgetGrid.getGridInfo();
    }
    return null;
  }

  settingStore.subscribe((value) => {
    document.body.style.backgroundImage = `url(${value.options.wallpaper})`;
  });
</script>

<WidgetGrid 
  bind:this={widgetGrid}
  minWidgetSize={120}
  gridGap={10}
  gridPadding={40}
  showGrid={true}
>
  <!-- FlipClock widget spanning 2 columns -->
  <FlipClock 
    gridRow={1}
    gridCol={1}
    gridSpanX={2}
    gridSpanY={1}
  />
</WidgetGrid>
