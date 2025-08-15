<svelte:options runes={true} />

<script lang="ts">
  import settingStore from "../../lib/stores/settingStore";
  import WidgetGrid from "../../lib/components/WidgetGrid.svelte";
  import Calendar from "../../lib/components/widgets/Calendar.svelte";
  import TestWidget from "../../lib/components/widgets/TestWidget.svelte";
  import FlipClock from "../../lib/components/widgets/clock/FlipClock.svelte";
  import AnalogClock from "@/lib/components/widgets/clock/AnalogClock.svelte";

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

  const drag = $state(true);
  const resize = $state(true);
</script>

<WidgetGrid
  bind:this={widgetGrid}
  minWidgetSize={120}
  gridGap={10}
  gridPadding={40}
  showGrid={true}
>
  <!-- <FlipClock
    gridRow={1}
    gridCol={1}
    gridSpanX={2}
    gridSpanY={1}
    draggable={drag}
    resizable={resize}
  /> -->

  <AnalogClock
    gridRow={1}
    gridCol={3}
    gridSpanX={2}
    gridSpanY={2}
    draggable={drag}
    resizable={resize}
    id="analog-clock"
  />

  <AnalogClock id="local-clock" />

  <AnalogClock id="ny-clock" city="New York" gridCol={3} />

  <AnalogClock id="london-clock" city="London" gridCol={5} />

  <AnalogClock id="tokyo-clock" city="Tokyo" gridRow={3} />

  <AnalogClock
    id="small-clock"
    city="Sydney"
    gridSpanX={1}
    gridSpanY={1}
    gridRow={3}
    gridCol={3}
  />

  <!-- <Calendar
    gridRow={2}
    gridCol={5}
    gridSpanX={2}
    gridSpanY={2}
    draggable={drag}
    resizable={resize}
  /> -->
</WidgetGrid>
