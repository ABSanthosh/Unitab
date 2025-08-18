<script lang="ts">
  import settingStore from "../../lib/stores/settingStore";
  import WidgetGrid from "../../lib/components/WidgetGrid.svelte";
  import Calendar from "../../lib/components/widgets/Calendar.svelte";
  import TestWidget from "../../lib/components/widgets/TestWidget.svelte";
  import FlipClock from "../../lib/components/widgets/clock/FlipClock.svelte";
  import AnalogClock from "@/lib/components/widgets/clock/AnalogClock.svelte";
  import Cat from "../../lib/components/widgets/Cat.svelte";
  import ContextMenu from "@/lib/components/ContextMenu.svelte";

  settingStore.subscribe((value: any) => {
    document.body.style.backgroundImage = `url(${value.options.wallpaper})`;
  });

  let settingStoreValue = $derived($settingStore);
</script>

<ContextMenu
  menuItems={[
    {
      name: "settings",
      onClick: () => {},
      displayText: "Settings",
    },
  ]}
/>
<!-- <div style="display: flex; flex-direction: row; gap: 10px;">
  <input
    type="checkbox"
    checked={settingStoreValue.options.isDraggable}
    onchange={() =>
      settingStore.update((store) => {
        store.options.isDraggable = !store.options.isDraggable;
        return store;
      })}
  />
  <input
    type="checkbox"
    checked={settingStoreValue.options.isResizable}
    onchange={() =>
      settingStore.update((store) => {
        store.options.isResizable = !store.options.isResizable;
        return store;
      })}
  />
</div> -->

<WidgetGrid gridGap={10} gridPadding={40} showGrid={false} minWidgetSize={120}>
  {#each Object.keys(settingStoreValue.widgets) as widgetId}
    {@const widget = settingStoreValue.widgets[widgetId]}
    {#if widget.type === "analog-clock"}
      <AnalogClock
        id={widget.id}
        pos={widget.pos}
        span={widget.span}
        settings={widget.settings}
        isDraggable={settingStoreValue.options.isDraggable}
        isResizable={settingStoreValue.options.isResizable}
        onDragEnd={(newRow, newCol) => {
          settingStore.update((store) => {
            store.widgets[widgetId].pos = { row: newRow, col: newCol };
            return store;
          });
        }}
        onResize={(newSpan) => {
          settingStore.update((store) => {
            store.widgets[widgetId].span = newSpan;
            return store;
          });
        }}
      />
    {:else if widget.type === "flip-clock"}
      <FlipClock
        id={widget.id}
        pos={widget.pos}
        span={widget.span}
        settings={widget.settings}
        isDraggable={settingStoreValue.options.isDraggable}
        isResizable={settingStoreValue.options.isResizable}
        onDragEnd={(newRow, newCol) => {
          settingStore.update((store) => {
            store.widgets[widgetId].pos = { row: newRow, col: newCol };
            return store;
          });
        }}
        onResize={(newSpan) => {
          settingStore.update((store) => {
            store.widgets[widgetId].span = newSpan;
            return store;
          });
        }}
      />
    {:else if widget.type === "calendar"}
      <Calendar
        id={widget.id}
        pos={widget.pos}
        span={widget.span}
        settings={widget.settings}
        isDraggable={settingStoreValue.options.isDraggable}
        isResizable={settingStoreValue.options.isResizable}
        onDragEnd={(newRow, newCol) => {
          settingStore.update((store) => {
            store.widgets[widgetId].pos = { row: newRow, col: newCol };
            return store;
          });
        }}
        onResize={(newSpan) => {
          settingStore.update((store) => {
            store.widgets[widgetId].span = newSpan;
            return store;
          });
        }}
      />
    {:else if widget.type === "cat"}
      <Cat
        id={widget.id}
        pos={widget.pos}
        span={widget.span}
        settings={widget.settings}
        isDraggable={settingStoreValue.options.isDraggable}
        isResizable={settingStoreValue.options.isResizable}
        onDragEnd={(newRow, newCol) => {
          settingStore.update((store) => {
            store.widgets[widgetId].pos = { row: newRow, col: newCol };
            return store;
          });
        }}
        onResize={(newSpan) => {
          settingStore.update((store) => {
            store.widgets[widgetId].span = newSpan;
            return store;
          });
        }}
      />
    {/if}
  {/each}
</WidgetGrid>
<!-- <FlipClock
  gridRow={1}
  gridCol={1}
  gridSpanX={2}
  gridSpanY={1}
  draggable={drag}
  resizable={resize}
/>

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

<Calendar
  gridRow={2}
  gridCol={5}
  gridSpanX={2}
  gridSpanY={2}
  draggable={drag}
  resizable={resize}
/> -->
