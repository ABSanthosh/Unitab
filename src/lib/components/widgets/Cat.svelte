<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import type { CatImage } from "@/lib/utils/CatEngine";
  import BlurredSpinner from "../BlurredSpinner.svelte";
  import { draggable, type DraggableOptions } from "../../actions/draggable";
  import { resizable, type ResizableOptions } from "../../actions/resizable";
  import type { CatSpan } from "../../stores/settingStore";
  import { catStoreActions, catImageStates } from "../../stores/catStore";

  interface Props {
    id: string;
    pos: {
      row: number;
      col: number;
    };
    span: CatSpan;
    isDraggable?: boolean;
    isResizable?: boolean;
    settings: Record<string, any>;
    onResize: (newSpan: CatSpan) => void;
    onDragEnd: (newRow: number, newCol: number) => void;
  }

  let {
    id,
    pos,
    span,
    settings,
    onResize,
    onDragEnd,
    isDraggable = true,
    isResizable = true,
  }: Props = $props();

  let imgSrc = $state<CatImage>({
    imageUrl: "",
    title: "",
    subreddit: "",
    postUrl: "",
    author: "",
  });

  // Get the cached image state for this widget
  const widgetCacheState = $derived($catImageStates[id]);
  
  // Update imgSrc when cache state changes
  $effect(() => {
    if (widgetCacheState?.image) {
      imgSrc = widgetCacheState.image;
    }
  });

  const isLoading = $derived(widgetCacheState?.isLoading ?? true);
  const hasError = $derived(!!widgetCacheState?.error);

  // Current position and size state
  let currentGridRow = $state(pos.row);
  let currentGridCol = $state(pos.col);
  let currentSpanX = $state(span.x);
  let currentSpanY = $state(span.y);

  let tooLong = $state(false);
  const sizeType = $derived(span.x === 1 && span.y === 1 ? "small" : "large");

  // Function to refresh the cat image
  async function refreshImage() {
    try {
      const newImage = await catStoreActions.refreshCatImage(id);
      imgSrc = newImage;
      tooLong = false; // Reset the too long state on successful refresh
    } catch (error) {
      console.error("Failed to refresh cat image:", error);
    }
  }

  // Handle drag end
  function handleDragEnd(newRow: number, newCol: number) {
    currentGridRow = newRow;
    currentGridCol = newCol;
    onDragEnd(newRow, newCol);
  }

  // Handle resize
  function handleResize(newSpanX: number, newSpanY: number) {
    // Type assertion to ensure only valid combinations are allowed
    const newSpan = { x: newSpanX, y: newSpanY } as CatSpan;
    currentSpanX = newSpan.x;
    currentSpanY = newSpan.y;
    onResize(newSpan);
  }

  // Draggable options
  const draggableOptions: DraggableOptions = {
    disabled: !isDraggable,
    onDragEnd: handleDragEnd,
  };

  // Resizable options
  const resizableOptions: ResizableOptions = {
    disabled: !isResizable,
    allowedSizes: ["1x1", "2x2"],
    onResize: handleResize,
  };

  onMount(() => {
    const timer = setTimeout(() => {
      tooLong = true;
    }, 2500);
    return () => clearTimeout(timer);
  });

  onMount(async () => {
    try {
      const cachedImage = await catStoreActions.getCatImage(id);
      imgSrc = cachedImage;
    } catch (err) {
      console.error("Error getting cat image:", err);
      imgSrc = {
        imageUrl: "",
        title: "Failed to load cat image",
        subreddit: "",
        postUrl: "",
        author: "",
      };
    }
  });
</script>

<div
  {id}
  class="CatBox BlurBG"
  style="
    background-image: url({imgSrc.imageUrl});
    grid-area: {currentGridRow} / {currentGridCol} / {currentGridRow +
    currentSpanY} / {currentGridCol + currentSpanX};
  "
  use:draggable={draggableOptions}
  use:resizable={resizableOptions}
>
  {#if imgSrc.imageUrl && !isLoading}
    {#if sizeType === "large"}
      <div class="CatBox__details">
        <h4>
          <a href={imgSrc.postUrl} target="_blank">
            r/{imgSrc.subreddit}
          </a>
        </h4>
        <h2 title={imgSrc.title}>{imgSrc.title}</h2>
        <button class="refresh-btn" onclick={refreshImage} title="Get a new cat image">
          🔄
        </button>
      </div>
    {:else}
      <button class="refresh-btn refresh-btn--small" onclick={refreshImage} title="Get a new cat image">
        🔄
      </button>
    {/if}
  {:else}
    <BlurredSpinner zIndex={-2}>
      {#if tooLong && !isLoading}
        <h3 class="CatBox--tooLong">
          <em>Can't find a free cat, refresh the page!</em>
        </h3>
      {:else if hasError}
        <div class="CatBox--error">
          <h3><em>Failed to load cat image</em></h3>
          <button onclick={refreshImage} class="retry-btn">Try Again</button>
        </div>
      {/if}
    </BlurredSpinner>
  {/if}
</div>

<style lang="scss">
  @use "../../../styles/mixins.scss" as *;

  .CatBox {
    color: #e4e4e4;
    position: relative;
    background-size: cover;
    background-position: center;
    @include make-flex($just: flex-end);
    border-radius: 20px;
    box-shadow: 0 0 20px 1px #00000087;

    // Let the widget grid system control dimensions
    width: 100%;
    height: 100%;
    min-height: 120px; // Ensure minimum usability

    &--tooLong {
      z-index: -1;
      padding: 0 20px;
      text-align: center;
    }

    &--error {
      z-index: 1;
      padding: 20px;
      text-align: center;
      color: #ff6b6b;
      
      .retry-btn {
        margin-top: 10px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: #e4e4e4;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    &:hover {
      .CatBox__details {
        opacity: 1;
      }
    }

    &__details {
      padding: 20px;
      overflow: hidden;
      position: relative;
      width: 100%;
      min-height: 80px; // Responsive height
      border-radius: 0 0 20px 20px;

      opacity: 0;
      transition: opacity 0.3s ease-in-out;

      &::after {
        content: "";
        position: absolute;
        left: -30px;
        z-index: -1;
        bottom: -50px;
        @include box(111%, 100%);
        background: rgba(0, 0, 0, 0.87);
        filter: blur(17.149999618530273px);
        border-radius: 0px 0px 20px 20px;
      }

      @include make-flex($align: flex-start, $just: flex-end);
      gap: 10px;
      z-index: 1;

      h4 {
        font-size: 14px;
        font-weight: 400;
        a {
          color: #c0c0c0;
          text-decoration: underline;
          &:hover {
            color: #e4e4e4;
          }
        }
      }

      h2 {
        font-size: 16px;
        font-weight: 500;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  .refresh-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    z-index: 2;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }

    &--small {
      opacity: 1;
      background: rgba(0, 0, 0, 0.4);
    }
  }

  .CatBox:hover .refresh-btn {
    opacity: 1;
  }
</style>
