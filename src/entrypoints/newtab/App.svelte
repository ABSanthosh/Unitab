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
  import { initializeWallpaperManager, cleanupWallpaperManager } from "../../lib/managers/wallpaperManager";
  import { onMount, onDestroy } from "svelte";

  settingStore.subscribe((value) => {
    document.body.style.backgroundImage = `url(${value.options.wallpaper.url})`;
  });

  let showModal = $state(false);

  onMount(() => {
    initializeWallpaperManager();
  });

  onDestroy(() => {
    cleanupWallpaperManager();
  });
</script>

<ContextMenu
  menuItems={[
    {
      name: "settings",
      onClick: () => (showModal = true),
      displayText: "Settings",
    },
    {
      name: "showGrid",
      onClick: () => {
        settingStore.update((store) => {
          store.options.showGrid = !store.options.showGrid;
          return store;
        });
      },
      displayText: $settingStore.options.showGrid ? "Hide Grid" : "Show Grid",
    },
    {
      name: "Resize Widgets",
      onClick: () => {
        settingStore.update((store) => {
          store.options.isResizable = !store.options.isResizable;
          return store;
        });
      },
      displayText: $settingStore.options.isResizable
        ? "Disable Resize"
        : "Enable Resize",
    },
    {
      name: "Drag Widgets",
      onClick: () => {
        settingStore.update((store) => {
          store.options.isDraggable = !store.options.isDraggable;
          return store;
        });
      },
      displayText: $settingStore.options.isDraggable
        ? "Disable Drag"
        : "Enable Drag",
    },
  ]}
/>

<WidgetModal bind:showModal />

<WidgetGrid
  gridGap={10}
  gridPadding={40}
  minWidgetSize={110}
  showGrid={$settingStore.options.showGrid}
>
  {#each Object.keys($settingStore.widgets) as widgetId}
    {@const widget = $settingStore.widgets[widgetId]}
    {#if widget.type === "analog-clock"}
      <AnalogClock
        id={widget.id}
        pos={widget.pos}
        span={widget.span}
        settings={widget.settings}
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
