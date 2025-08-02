<svelte:options runes={true} />

<script lang="ts">
  import { draggable, type DraggableOptions } from "../../actions/draggable";
  import { resizable, type ResizableOptions } from "../../actions/resizable";
  import { ChevronLeft, ChevronRight, RotateCcw } from "@lucide/svelte";

  interface Props {
    gridRow?: number;
    gridCol?: number;
    gridSpanX?: number;
    gridSpanY?: number;
    draggable?: boolean;
    resizable?: boolean;
    id?: string;
  }

  let {
    gridRow = 1,
    gridCol = 1,
    gridSpanX = 2,
    gridSpanY = 2,
    draggable: isDraggable = true,
    resizable: isResizable = true,
    id = "calendar",
  }: Props = $props();

  // Current position and size state
  let currentGridRow = $state(gridRow);
  let currentGridCol = $state(gridCol);
  let currentSpanX = $state(gridSpanX);
  let currentSpanY = $state(gridSpanY);

  // Calendar data
  let currentDate = new Date();
  let currentMonth = $state(currentDate.getMonth());
  let currentYear = $state(currentDate.getFullYear());
  let today = $state(currentDate.getDate());

  const resetMonth = () => {
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    today = currentDate.getDate();
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear += 1;
    } else {
      currentMonth += 1;
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear -= 1;
    } else {
      currentMonth -= 1;
    }
  };

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
    allowedSizes: ["1x1", "2x2"],
    onResizeStart: () => {
      isResizing = true;
    },
    onResize: (spanX, spanY) => {
      currentSpanX = spanX;
      currentSpanY = spanY;
    },
    onResizeEnd: () => {
      // Clear any existing timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      // Reset isResizing after a short delay
      resizeTimeout = setTimeout(() => {
        isResizing = false;
      }, 100);
    },
  };

  // Track if we're currently resizing to hide content
  let isResizing = $state(false);
  let resizeTimeout: ReturnType<typeof setTimeout>;

  // Calendar utilities
  const monthNames = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const shortMonthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const shortDayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const dayAbbreviations = ["S", "M", "T", "W", "T", "F", "S"];

  // Check if widget should show compact layout
  // Show compact during resize OR when size is not 2x2
  let shouldShowCompact = $derived(isResizing || !(currentSpanX === 2 && currentSpanY === 2));

  // Get current day of week for 1x1 mode
  let currentDayOfWeek = $derived(() => {
    const date = new Date(currentYear, currentMonth, today);
    return date.getDay();
  });

  // Get the actual current date for compact display
  let actualToday = $derived(() => {
    const now = new Date();
    return now.getDate();
  });

  // Get the actual day of week for compact display
  let actualDayOfWeek = $derived(() => {
    const now = new Date();
    return now.getDay();
  });

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  function generateCalendarDays() {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Calculate the number of rows needed (weeks)
    // rowCount = Math.ceil(days.length / 7);

    return days;
  }

  $effect(() => {
    // Update today when the component mounts or date changes
    const now = new Date();
    if (now.getMonth() === currentMonth && now.getFullYear() === currentYear) {
      today = now.getDate();
    } else {
      today = -1; // No current day highlight for other months
    }
  });

  let calendarDays = $derived(generateCalendarDays());
  let rowCount = $derived(Math.ceil(calendarDays.length / 7)); // 6 rows for the calendar
</script>

<div
  class="calendar-widget draggable-widget"
  class:compact={shouldShowCompact}
  style={`grid-area: ${currentGridRow} / ${currentGridCol} / ${currentGridRow + currentSpanY} / ${currentGridCol + currentSpanX};
      --rowCount: ${rowCount};`}
  use:draggable={draggableOptions}
  use:resizable={resizableOptions}
  {id}
>
  <div class="calendar-container">
    {#if shouldShowCompact}
      <!-- Compact 1x1 layout -->
      <div class="compact-calendar">
        <div class="compact-header">
          <div class="compact-month">
            {shortMonthNames[new Date().getMonth()]}
          </div>
          <div class="compact-day-name">
            {shortDayNames[actualDayOfWeek()]}
          </div>
        </div>
        <div class="compact-date">{actualToday()}</div>
      </div>
    {:else}
      <!-- Full 2x2 layout -->
      <!-- Month Header -->
      <div class="month-header">
        <h2 class="month-name">{shortMonthNames[currentMonth]}. {currentYear}</h2>
        <div class="month-controls">
          <button class="prev-month" on:click={prevMonth}>
            <ChevronLeft size="16" />
          </button>
          <button class="reset-month" on:click={resetMonth}>
            <RotateCcw size="16" />
          </button>
          <button class="next-month" on:click={nextMonth}>
            <ChevronRight size="16" />
          </button>
        </div>
      </div>

      <!-- Day Headers -->
      <div class="day-headers">
        {#each dayAbbreviations as day}
          <div class="day-header">{day}</div>
        {/each}
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        {#each calendarDays as day}
          <div
            class="calendar-day"
            class:today={day === today}
            class:empty={day === null}
          >
            {day || ""}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .calendar-widget {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    position: relative;

    // Ensure the widget fills the grid cell properly
    width: 100%;
    height: 100%;
    min-height: 240px; // Minimum height for 2x2 calendar

    // Force proper sizing during resize transitions
    &.compact {
      min-height: 120px; // Smaller minimum height for 1x1
    }

    & > * {
      user-select: none;
    }
  }

  .calendar-container {
    padding: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: hidden; // Prevent overflow
  }

  .month-header {
    text-align: center;
    // margin-bottom: 2px;
    flex-shrink: 0; // Don't let this shrink
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .month-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .prev-month,
    .next-month,
    .reset-month {
      background: transparent;
      border: none;
      color: #374151;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;

      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
      }
    }
  }

  .month-name {
    font-size: 16px;
    font-weight: 600;
    color: #ef4444;
    letter-spacing: 1px;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    // margin-bottom: 2px;
    flex-shrink: 0; // Don't let this shrink
  }

  .day-header {
    text-align: center;
    font-size: 9px;
    font-weight: 500;
    color: #6b7280;
    padding: 1px 0;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(var(--rowCount), 1fr);
    gap: 1px;
    flex: 1;
    min-height: 0; // Allow the grid to shrink
  }

  .calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    border-radius: 4px;
    transition:
      background-color 0.2s ease,
      transform 0.1s ease;
    position: relative;
    min-height: 0; // Allow shrinking
    height: 100%; // Fill the grid cell
    width: 100%; // Fill the grid cell

    &:not(.empty):not(.today):hover {
      background-color: rgba(59, 130, 246, 0.1);
      transform: scale(1.05);
    }

    &.today {
      background-color: #ef4444;
      color: white;
      font-weight: 600;
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    &.empty {
      visibility: hidden;
    }
  }

  // Compact 1x1 layout styles
  .calendar-widget.compact {
    // Use same background as 2x2 layout
    background: rgba(255, 255, 255, 0.95);

    .calendar-container {
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .compact-calendar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
    height: 100%;
  }

  .compact-header {
    gap: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .compact-month {
    font-size: 20px;
    font-weight: 800;
    color: #ef4444;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }

  .compact-day-name {
    font-size: 20px;
    font-weight: 800;
    color: #6b7280;
    letter-spacing: 0.5px;
  }

  .compact-date {
    font-size: 55px;
    font-weight: 700;
    color: #374151;
    line-height: 1;
  }

  // Responsive adjustments based on widget size
  .calendar-widget {
    // For 2x2 grid (default) - smaller, tighter spacing
    .month-name {
      font-size: 16px;
    }

    .day-header {
      font-size: 9px;
    }

    .calendar-day {
      font-size: 10px;
    }
  }

  // Larger sizes get bigger text and more spacing
  :global(.calendar-widget[style*="/ 4"]) {
    // 3x3 width
    .calendar-container {
      padding: 16px;
      gap: 8px;
    }

    .month-name {
      font-size: 16px;
    }

    .day-header {
      font-size: 11px;
    }

    .calendar-day {
      font-size: 12px;
      border-radius: 6px;
    }

    .calendar-grid,
    .day-headers {
      gap: 2px;
    }
  }

  :global(.calendar-widget[style*="/ 5"]) {
    // 4x4+ width
    .calendar-container {
      padding: 16px;
      gap: 10px;
    }

    .month-name {
      font-size: 22px;
    }

    .day-header {
      font-size: 13px;
    }

    .calendar-day {
      font-size: 16px;
      border-radius: 8px;
    }

    .calendar-grid,
    .day-headers {
      gap: 3px;
    }
  }
</style>
