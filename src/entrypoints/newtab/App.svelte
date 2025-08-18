<script lang="ts">
  import settingStore from "../../lib/stores/settingStore";
  import WidgetGrid from "../../lib/components/WidgetGrid.svelte";
  import Calendar from "../../lib/components/widgets/Calendar.svelte";
  import TestWidget from "../../lib/components/widgets/TestWidget.svelte";
  import FlipClock from "../../lib/components/widgets/clock/FlipClock.svelte";
  import AnalogClock from "@/lib/components/widgets/clock/AnalogClock.svelte";
  import Cat from "../../lib/components/widgets/Cat.svelte";
  import ContextMenu from "@/lib/components/ContextMenu.svelte";
  import WidgetModal from "@/lib/components/WidgetModal/WidgetModal.svelte";

  settingStore.subscribe((value) => {
    document.body.style.backgroundImage = `url(${value.options.wallpaper.url})`;
  });

  let settingStoreValue = $derived($settingStore);
  let showModal = $state(false);
</script>

<ContextMenu
  menuItems={[
    {
      name: "settings",
      onClick: () => (showModal = true),
      displayText: "Settings",
    },
  ]}
/>

<WidgetModal bind:showModal />

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
