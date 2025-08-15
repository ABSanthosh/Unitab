<script lang="ts">
  import { onMount } from "svelte";
  import { draggable } from "../../../actions/draggable";
  import { resizable } from "../../../actions/resizable";

  let time = $state(new Date());

  interface Props {
    gridRow?: number;
    gridCol?: number;
    gridSpanX?: number;
    gridSpanY?: number;
    draggable?: boolean;
    resizable?: boolean;
    id: string;
  }

  // settings
  // Show numbers
  // Show seconds hand

  let {
    id,
    gridRow = 1,
    gridCol = 1,
    gridSpanX = 2,
    gridSpanY = 2,
    draggable: isDraggable = true,
    resizable: isResizable = true,
  }: Props = $props();

  // Current position and size state
  let currentGridRow = $state(gridRow);
  let currentGridCol = $state(gridCol);
  let currentSpanX = $state(gridSpanX);
  let currentSpanY = $state(gridSpanY);

  // Draggable options
  const draggableOptions = {
    disabled: !isDraggable,
    onDragEnd: handleDragEnd,
  };

  // Resizable options
  const resizableOptions = {
    disabled: !isResizable,
    allowedSizes: ["1x1", "2x2"],
    onResize: handleResize,
  };

  let hours = $derived(time.getHours());
  let minutes = $derived(time.getMinutes());
  let seconds = $derived(time.getSeconds());

  // Handle drag end to update position
  function handleDragEnd(newRow: number, newCol: number) {
    currentGridRow = newRow;
    currentGridCol = newCol;
  }

  // Handle resize to update size
  function handleResize(newSpanX: number, newSpanY: number) {
    currentSpanX = newSpanX;
    currentSpanY = newSpanY;
  }

  onMount(() => {
    const interval = setInterval(() => {
      time = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<div
  {id}
  use:draggable={draggableOptions}
  use:resizable={resizableOptions}
  class="AnalogClock BlurBG draggable-widget"
  style="grid-area: {currentGridRow} / {currentGridCol} / {currentGridRow +
    currentSpanY} / {currentGridCol + currentSpanX};"
  data-type={currentSpanX === 1 && currentSpanY === 1 ? "small" : "large"}
>
  <svg viewBox="-50 -50 100 100">
    <circle class="AnalogClock__face" r="48" />
    {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
      <line
        y2="45"
        class="AnalogClock__major"
        transform="rotate({30 * minute})"
        y1={currentSpanX === 1 && currentSpanY === 1 ? "39" : "42"}
      />
      {#if !(currentSpanX === 1 && currentSpanY === 1)}
        <text
          fill="black"
          text-anchor="middle"
          x={36 * Math.sin((Math.PI / 30) * minute)}
          y={-36 * Math.cos((Math.PI / 30) * minute) + 3}
        >
          {#if minute == 0}
            12
          {:else}
            {minute / 5}
          {/if}
        </text>
      {/if}

      {#each [1, 2, 3, 4] as offset}
        <line
          y1="42"
          y2="45"
          class="AnalogClock__minor"
          transform="rotate({6 * (minute + offset)})"
        />
      {/each}
    {/each}

    <!-- hour hand -->
    <g class="AnalogClock__hour" transform="rotate({30 * hours + minutes / 2})">
      <line class="AnalogClock__hour--base" y1="0" y2="-8" />
      <line class="AnalogClock__hour--line" y1="-7" y2="-26" />
      <circle r="2" />
    </g>

    <!-- minute hand -->
    <g
      class="AnalogClock__minute"
      transform="rotate({6 * minutes + seconds / 10})"
    >
      <line class="AnalogClock__minute--base" y1="0" y2="-12" />
      <line class="AnalogClock__minute--line" y1="-7" y2="-40" />
    </g>

    <!-- second hand -->
    <g class="AnalogClock__second" transform="rotate({6 * seconds})">
      <line class="AnalogClock__second--line" y1="6" y2="-44" />
      <circle r="1" />
    </g>
    <circle r="0.7" />
  </svg>
</div>

<style lang="scss">
  @use "../../../../styles/mixins.scss" as *;

  .AnalogClock {
    // Ensure component fits within grid system
    padding: 8px;
    @include box();
    max-width: 100%;
    max-height: 100%;
    min-width: 120px;
    min-height: 120px;
    @include make-flex();
    box-sizing: border-box;

    // Ensure proper positioning within grid
    overflow: hidden;
    position: relative;

    // Responsive padding based on size
    @include respondAt(768px) {
      padding: 6px;
    }
    @include respondAt(480px) {
      padding: 4px;
    }

    & > svg {
      @include box();
      aspect-ratio: 1;
      max-width: 100%;
      max-height: 100%;

      & > circle {
        // TODO: Theme
        fill: #fff;
      }
    }

    &__face {
      // TODO: Theme
      fill: white;
    }

    &__major,
    &__minor {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    &[data-type="small"] {
      .AnalogClock__major {
        stroke-width: 1.5;
      }
      .AnalogClock__minor {
        stroke-width: 0.8;
      }
    }

    &__major {
      stroke: #333;
      stroke-width: 1;
    }

    text {
      // TODO: Theme
      font-weight: 600;
      font-size: clamp(4px, 1.2vw, 8px);
    }

    &__minor {
      // TODO: Theme
      stroke: #999;
      stroke-width: 0.5;
    }

    &__hour {
      --color: #1f1f1f;
      & > circle {
        stroke: var(--color);
      }
      &--base {
        stroke-width: 1.5;
        stroke: var(--color);
      }
      &--line {
        stroke-width: 3.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: #111111;
        filter: drop-shadow(0px 0px 2px rgb(0 0 0 / 0.4));
      }
    }

    &__minute {
      --color: #1f1f1f;
      &--base {
        stroke-width: 1.5;
        stroke: var(--color);
      }
      &--line {
        stroke-width: 3.5;
        stroke: #111111;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0px 0px 2px rgb(0 0 0 / 0.4));
      }
    }

    &__second {
      &--line {
        stroke-width: 1;
        stroke: #ff0000;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2));
      }

      & > circle {
        stroke: #ff0000;
        fill: #ff0000;
      }
    }

    // Responsive adjustments for smaller screens
    @include respondAt(768px) {
      &__hour--line,
      &__minute--line {
        stroke-width: 3;
      }

      &__major {
        stroke-width: 0.8;
      }

      &__minor {
        stroke-width: 0.4;
      }
    }

    @include respondAt(480px) {
      &__hour--line,
      &__minute--line {
        stroke-width: 2.5;
      }

      &__major {
        stroke-width: 0.6;
      }

      &__minor {
        stroke-width: 0.3;
      }

      &__second--line {
        stroke-width: 0.8;
      }
    }
  }
</style>
