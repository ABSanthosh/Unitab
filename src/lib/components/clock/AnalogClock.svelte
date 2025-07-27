<script lang="ts">
  import { onMount } from "svelte";
  import { draggable, type DraggableOptions } from "../../actions/draggable";

  let time = $state(new Date());

  interface Props {
    gridRow?: number;
    gridCol?: number;
    gridSpanX?: number;
    gridSpanY?: number;
    draggable?: boolean;
    id: string;
  }

  let {
    id,
    gridRow = 1,
    gridCol = 1,
    gridSpanX = 2,
    gridSpanY = 2,
    draggable: isDraggable = true,
  }: Props = $props();

  // Current position state
  let currentGridRow = $state(gridRow);
  let currentGridCol = $state(gridCol);

  // Draggable options
  const draggableOptions = {
    disabled: !isDraggable,
    onDragEnd: handleDragEnd,
  };

  let hours = $derived(time.getHours());
  let minutes = $derived(time.getMinutes());
  let seconds = $derived(time.getSeconds());

  // Handle drag end to update position
  function handleDragEnd(newRow: number, newCol: number) {
    currentGridRow = newRow;
    currentGridCol = newCol;
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
  class="AnalogClock BlurBG draggable-widget" 
  use:draggable={draggableOptions}
  {id}
  style="
    grid-area: {currentGridRow} / {currentGridCol} / {currentGridRow + gridSpanY} / {currentGridCol + gridSpanX};
  "
>
  <svg viewBox="-50 -50 100 100">
    <circle class="AnalogClock__face" r="48" />
    {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
      <line
        class="AnalogClock__major"
        y1="39"
        y2="45"
        transform="rotate({30 * minute})"
      />
      <text
        x={34 * Math.sin((Math.PI / 30) * minute)}
        y={-34 * Math.cos((Math.PI / 30) * minute) + 2}
        fill="black"
        font-size="6px"
        text-anchor="middle"
      >
        {#if minute == 0}
          12
        {:else}
          {minute / 5}
        {/if}
      </text>

      {#each [1, 2, 3, 4] as offset}
        <line
          class="AnalogClock__minor"
          y1="42"
          y2="45"
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
	@use "../../../styles/mixins.scss" as *;

  .AnalogClock {
    // Ensure component fits within grid system
    width: 100%;
    height: 100%;
    min-width: 120px;
    min-height: 120px;
    max-width: 100%;
    max-height: 100%;
    @include make-flex();
    padding: 8px;
    box-sizing: border-box;
    
    // Ensure proper positioning within grid
    position: relative;
    overflow: hidden;

    // Responsive padding based on size
    @media (max-width: 768px) {
      padding: 6px;
    }

    @media (max-width: 480px) {
      padding: 4px;
    }

    & > svg {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 1;
      
      & > circle {
        fill: #fff;
      }
    }
    
    &__face {
      fill: white;
    }

    &__major,
    &__minor {
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    &__major {
      stroke: #333;
      stroke-width: 1;
    }
    
    text {
      font-family: "Lora", serif;
      font-size: clamp(4px, 1.2vw, 6px);
    }

    &__minor {
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
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: #111111;
        filter: drop-shadow(0px 0px 2px rgb(0 0 0 / 0.4));
      }
    }

    &__second {
      &--line {
        stroke-width: 1;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: #ff0000;
        filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2));
      }

      & > circle {
        stroke: #ff0000;
        fill: #ff0000;
      }
    }

    // Responsive adjustments for smaller screens
    @media (max-width: 768px) {
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

    @media (max-width: 480px) {
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
