<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import {
    getRandomImageFromSubreddit,
    type CatImage,
  } from "@/lib/utils/redditCat";
  import BlurredSpinner from "../BlurredSpinner.svelte";
  import { draggable, type DraggableOptions } from "../../actions/draggable";
  import { resizable, type ResizableOptions } from "../../actions/resizable";
  import type { CatSpan } from "../../stores/settingStore";
  import { getNextCatFromMagazine } from "@/lib/utils/catMagazine";

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

  // Current position and size state
  let currentGridRow = $state(pos.row);
  let currentGridCol = $state(pos.col);
  let currentSpanX = $state(span.x);
  let currentSpanY = $state(span.y);

  let tooLong = $state(false);
  const sizeType = $derived(span.x === 1 && span.y === 1 ? "small" : "large");

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
      imgSrc = await getNextCatFromMagazine();
    } catch (err) {
      console.error("Error getting cat image from magazine:", err);
      imgSrc = {
        imageUrl: "",
        title: "",
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
  {#if imgSrc.imageUrl}
    {#if sizeType === "large"}
      <div class="CatBox__details">
        <h4>
          <a href={imgSrc.postUrl} target="_blank">
            r/{imgSrc.subreddit}
          </a>
        </h4>
        <h2 title={imgSrc.title}>{imgSrc.title}</h2>
      </div>
    {/if}
  {:else}
    <BlurredSpinner zIndex={-2}>
      {#if tooLong}
        <h3 class="CatBox--tooLong">
          <em>Can't find a free cat, refresh the page!</em>
        </h3>
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
</style>
