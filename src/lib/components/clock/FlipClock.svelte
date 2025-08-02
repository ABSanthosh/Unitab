<svelte:options runes={true} />

<script lang="ts">
  // Ref: https://github.com/ronanru/svelte-flip-clock/blob/main/src/lib/FlipClock.svelte
  // Insp: https://gridfiti.com/wp-content/uploads/2021/08/Gridfiti_Blog_BestiPadWidgets_Clock.jpg
  import { onMount, onDestroy } from "svelte";
  import { draggable, type DraggableOptions } from "../../actions/draggable";
  import { resizable, type ResizableOptions } from "../../actions/resizable";

  interface Props {
    gridRow?: number;
    gridCol?: number;
    gridSpanX?: number;
    gridSpanY?: number;
    draggable?: boolean;
    resizable?: boolean;
  }

  let {
    gridRow = 1,
    gridCol = 1,
    gridSpanX = 2,
    gridSpanY = 1,
    draggable: isDraggable = true,
    resizable: isResizable = true,
  }: Props = $props();

  let time = $state(new Date());
  let clockContainer: HTMLDivElement;
  let containerWidth = $state(240);
  let interval: NodeJS.Timeout;

  // Current position and size state
  let currentGridRow = $state(gridRow);
  let currentGridCol = $state(gridCol);
  let currentSpanX = $state(gridSpanX);
  let currentSpanY = $state(gridSpanY);

  // Draggable options
  const draggableOptions: DraggableOptions = {
    disabled: !isDraggable,
    onDragEnd: (row, col) => {
      currentGridRow = row;
      currentGridCol = col;
    },
  };

  // Resizable options
  const resizableOptions: ResizableOptions = {
    disabled: !isResizable,
    allowedSizes: ["2x1", "2x2"],
    onResize: (spanX, spanY) => {
      currentSpanX = spanX;
      currentSpanY = spanY;
    },
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Reactive date calculation
  const fullDate = $derived(() => {
    const date = time.getDate();
    const day = days[time.getDay()];
    const month = months[time.getMonth()];
    const year = time.getFullYear();
    return `${day}, ${date} ${month} ${year}`;
  });

  let display = $state([
    {
      top: "00",
      bottom: "00",
      transition: false,
    },
    {
      top: "00",
      bottom: "00",
      transition: false,
    },
    {
      top: "00",
      bottom: "00",
      transition: false,
    },
  ]);

  // Update container width for responsive font sizing
  function updateContainerSize() {
    if (clockContainer) {
      containerWidth = clockContainer.offsetWidth;
    }
  }

  onMount(() => {
    // Initialize time and display
    time = new Date();
    const initialData = [
      (time.getHours() % 12 || 12).toString().padStart(2, "0"),
      time.getMinutes().toString().padStart(2, "0"),
      time.getSeconds().toString().padStart(2, "0"),
    ];

    display = initialData.map((value) => ({
      top: value,
      bottom: value,
      transition: false,
    }));

    // Update container size
    updateContainerSize();

    // Set up resize observer for responsive sizing
    const resizeObserver = new ResizeObserver(() => {
      updateContainerSize();
    });

    if (clockContainer) {
      resizeObserver.observe(clockContainer);
    }

    // Start the clock interval
    interval = setInterval(() => {
      time = new Date();
      const newData = [
        (time.getHours() % 12 || 12).toString().padStart(2, "0"),
        time.getMinutes().toString().padStart(2, "0"),
        time.getSeconds().toString().padStart(2, "0"),
      ];

      // Trigger flip animation for changed segments
      display = display.map(({ bottom }, i) => ({
        top: newData[i],
        bottom,
        transition: newData[i] !== bottom,
      }));

      // Complete the flip after animation
      setTimeout(() => {
        display = display.map((_, i) => ({
          bottom: newData[i],
          top: newData[i],
          transition: false,
        }));
      }, 500);
    }, 1000);

    return () => {
      clearInterval(interval);
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
</script>

<div
  bind:this={clockContainer}
  class="FlipClock BlurBG"
  class:draggable-widget={isDraggable}
  use:draggable={draggableOptions}
  use:resizable={resizableOptions}
  style="
		grid-area: {currentGridRow} / {currentGridCol} / {currentGridRow +
    currentSpanY} / {currentGridCol + currentSpanX};
		--container-width: {containerWidth}px;
		--base-size: {containerWidth * 0.06}px;
		--segment-size: {containerWidth * 0.16}px;
		--date-size: {containerWidth * 0.07}px;
	"
>
  <div class="FlipClock__box">
    <div class="FlipClock__overlay">
      {#each display as segment, index}
        <div class="FlipClock__segment">
          <p
            class="FlipClock__segment--top"
            class:transition={segment.transition}
          >
            <span>
              {segment.bottom}
            </span>
          </p>
          <p
            class="FlipClock__segment--bottom"
            class:transition={segment.transition}
          >
            <span>
              {segment.top}
            </span>
          </p>
        </div>
        {#if index < 2}
          <div class="FlipClock__colon">:</div>
        {/if}
      {/each}
    </div>
    <div class="FlipClock__base">
      {#each display as segment, index}
        <div class="FlipClock__segment">
          <p class="FlipClock__segment--top">
            {segment.top}
          </p>
          <p class="FlipClock__segment--bottom">
            {segment.bottom}
          </p>
        </div>
        {#if index < 2}
          <div class="FlipClock__colon">:</div>
        {/if}
      {/each}
    </div>
  </div>
  <p class="FlipClock__date">
    {fullDate()}
  </p>
</div>

<style lang="scss">
  .FlipClock {
    width: 100%;
    height: 100%;
    gap: calc(var(--base-size) * 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: calc(var(--base-size) * 0.8);
    box-sizing: border-box;

    & > * {
      user-select: none;
    }

    &__date {
      font-size: var(--date-size);
      font-family: "JetBrains Mono", monospace;
      color: white;
      margin: 0;
      text-align: center;
      white-space: nowrap;
    }

    &__box {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      max-height: 70%;
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      grid-template-rows: 1fr;
      gap: calc(var(--base-size) * 0.4);
      align-items: center;
    }

    &__overlay {
      grid-area: 1 / 1 / 2 / 6;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: calc(var(--base-size) * 0.4);
      align-items: center;
      z-index: 10;

      .FlipClock__segment {
        &--bottom {
          transform: scaleY(0);
        }
      }
    }

    &__base {
      grid-area: 1 / 1 / 2 / 6;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: calc(var(--base-size) * 0.4);
      align-items: center;
    }

    &__colon {
      font-size: var(--segment-size);
      font-family: "JetBrains Mono", monospace;
      font-weight: 500;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding-bottom: 5px;
      animation: blink 1s infinite;
    }

    &__segment {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      color: white;
      position: relative;

      --__separator: 0px;

      p,
      span {
        background-color: transparent;
        border-radius: calc(var(--base-size) * 0.3);
        font-size: var(--segment-size);
        font-family: "JetBrains Mono", monospace;
        font-weight: 600;
        transition: background-color 0.1s ease;
      }

      &--top,
      &--bottom {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin: 0;
      }

      &--top {
        position: absolute;
        top: 0;
        left: 0;
        clip-path: inset(0px 0px calc(50% + var(--__separator)) 0px);

        &.transition {
          transition: transform 0.25s ease-in;
          transform: scaleY(0);

          p,
          span {
            background-color: rgba(18, 18, 18, 0.9);
            backdrop-filter: blur(10px);
          }
        }
      }

      &--bottom {
        clip-path: inset(calc(50% + var(--__separator)) 0px 0px 0px);
        top: 0;
        left: 0;
        position: absolute;

        &.transition {
          transition: transform 0.25s 0.25s ease-out;
          transform: scale(100%);

          p,
          span {
            background-color: rgba(18, 18, 18, 0.9);
            backdrop-filter: blur(10px);
          }
        }
      }
    }

    @keyframes blink {
      0%,
      50% {
        opacity: 1;
      }
      51%,
      100% {
        opacity: 0.1;
      }
    }
  }
</style>
