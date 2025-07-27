<svelte:options runes={true} />

<script lang="ts">
  import settingStore from "../../lib/stores/settingStore";
  import WidgetGrid from "../../lib/components/WidgetGrid.svelte";
  import FlipClock from "../../lib/components/clock/FlipClock.svelte";
  import TestWidget from "../../lib/components/widgets/TestWidget.svelte";
  import AnalogClock from "@/lib/components/clock/AnalogClock.svelte";

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
    draggable={true}
  />

  <AnalogClock
    gridRow={1}
    gridCol={3}
    gridSpanX={3}
    gridSpanY={3}
    draggable={true}
    id="analog-clock"
  />

  <!-- Test widgets to demonstrate dragging -->
  <TestWidget
    gridRow={1}
    gridCol={4}
    gridSpanX={1}
    gridSpanY={1}
    draggable={true}
    title="Widget A"
    color="#f59e0b"
  />

  <TestWidget
    gridRow={2}
    gridCol={2}
    gridSpanX={1}
    gridSpanY={1}
    draggable={true}
    title="Widget B"
    color="#10b981"
  />

  <TestWidget
    gridRow={3}
    gridCol={1}
    gridSpanX={2}
    gridSpanY={1}
    draggable={true}
    title="Wide Widget"
    color="#8b5cf6"
  />
</WidgetGrid>
