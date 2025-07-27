<svelte:options runes={true} />

<script lang="ts">
  import { draggable, type DraggableOptions } from "../../actions/draggable";

  interface Props {
    gridRow?: number;
    gridCol?: number;
    gridSpanX?: number;
    gridSpanY?: number;
    draggable?: boolean;
    title?: string;
    color?: string;
  }

  let {
    gridRow = 1,
    gridCol = 1,
    gridSpanX = 1,
    gridSpanY = 1,
    draggable: isDraggable = true,
    title = "Widget",
    color = "#6366f1"
  }: Props = $props();

  // Current position state
  let currentGridRow = $state(gridRow);
  let currentGridCol = $state(gridCol);

  // Draggable options
  const draggableOptions: DraggableOptions = {
    disabled: !isDraggable,
    onDragEnd: (row, col) => {
      currentGridRow = row;
      currentGridCol = col;
    }
  };
</script>

<div
  class="test-widget BlurBG draggable-widget"
  use:draggable={draggableOptions}
  style="
    grid-area: {currentGridRow} / {currentGridCol} / {currentGridRow + gridSpanY} / {currentGridCol + gridSpanX};
    --widget-color: {color};
  "
>
  <div class="widget-content">
    <h3>{title}</h3>
    <p>Position: {currentGridRow}, {currentGridCol}</p>
    <p>Size: {gridSpanX} × {gridSpanY}</p>
  </div>
</div>

<style lang="scss">
  .test-widget {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;
    
    &:hover {
      border-color: var(--widget-color);
    }

    .widget-content {
      text-align: center;
      color: white;
      
      h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--widget-color);
      }
      
      p {
        margin: 5px 0;
        font-size: 12px;
        opacity: 0.8;
        font-family: 'JetBrains Mono', monospace;
      }
    }
  }
</style>
