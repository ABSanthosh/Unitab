import { writable } from "svelte/store";
import { SupportedCityName } from "../utils/timezone";
import { catStoreActions } from "./catStore";

type Widget = {
  id: string;
  pos: {
    row: number;
    col: number;
  };
};

// Define valid span combinations for each widget type
type AnalogClockSpan =
  | { x: 1; y: 1 } // Small widget
  | { x: 2; y: 2 }; // Large widget

type FlipClockSpan =
  | { x: 2; y: 1 } // Compact widget
  | { x: 2; y: 2 }; // Large widget

type CalendarSpan =
  | { x: 1; y: 1 } // Compact widget
  | { x: 2; y: 2 }; // Large widget

type CatSpan =
  | { x: 1; y: 1 } // Small cat widget
  | { x: 2; y: 2 }; // Large cat widget

type AnalogClockWidget = Widget & {
  type: "analog-clock";
  span: AnalogClockSpan;
  settings: {
    showNumbers: boolean;
    showSecondsHand: boolean;
    city?: SupportedCityName;
  };
};

type FlipClockWidget = Widget & {
  type: "flip-clock";
  span: FlipClockSpan;
  settings: {
    showSeconds: boolean;
    city?: SupportedCityName;
  };
};

type CalendarWidget = Widget & {
  type: "calendar";
  span: CalendarSpan;
  settings: {
    city?: SupportedCityName;
  };
};

type CatWidget = Widget & {
  type: "cat";
  span: CatSpan;
  settings: {
    // No specific settings for cat widget currently
  };
};

interface SettingStore {
  options: {
    isDraggable: boolean;
    isResizable: boolean;
    wallpaper: string;
    showGrid: boolean;
  };
  widgets: Record<string, AnalogClockWidget | FlipClockWidget | CalendarWidget | CatWidget>;
  wallpapers: string[];
}

const defaultStore: SettingStore = {
  options: {
    isDraggable: true,
    isResizable: true,
    wallpaper: "/assets/wallpapers/blobs-l.svg",
    showGrid: true,
  },
  widgets: {
    "analog-clock-1": {
      id: "analog-clock-1",
      pos: { row: 1, col: 1 },
      type: "analog-clock",
      span: { x: 2, y: 2 },
      settings: {
        showNumbers: true,
        showSecondsHand: true,
      },
    },
    "flip-clock-1": {
      id: "flip-clock-1",
      pos: { row: 1, col: 3 },
      type: "flip-clock",
      span: { x: 2, y: 1 },
      settings: {
        showSeconds: true,
      },
    },
    "calendar-1": {
      id: "calendar-1",
      pos: { row: 3, col: 1 },
      type: "calendar",
      span: { x: 2, y: 2 },
      settings: {},
    },
    "cat-1": {
      id: "cat-1",
      pos: { row: 1, col: 5 },
      type: "cat",
      span: { x: 2, y: 2 },
      settings: {},
    },
  },
  wallpapers: [
    "/assets/wallpapers/adwaita-d.jpg",
    "/assets/wallpapers/adwaita-l.jpg",
    "/assets/wallpapers/blobs-d.svg",
    "/assets/wallpapers/blobs-l.svg",
    "/assets/wallpapers/drool-d.svg",
    "/assets/wallpapers/drool-l.svg",
    "/assets/wallpapers/fold-d.jpg",
    "/assets/wallpapers/fold-l.jpg",
    "/assets/wallpapers/ventura-d.jpg",
  ],
};

const settingStore = writable<SettingStore>(
  JSON.parse(window.localStorage.getItem("settingStore")!) ?? defaultStore
);

let timer: NodeJS.Timeout | null;

settingStore.subscribe((value) => {
  clearTimeout(timer as NodeJS.Timeout);
  timer = setTimeout(() => {
    window.localStorage.setItem("settingStore", JSON.stringify(value));
  }, 1000);
});

// Cleanup function for when widgets are removed
function cleanupWidget(widgetId: string, widgetType: string) {
  if (widgetType === "cat") {
    catStoreActions.removeCatImage(widgetId);
  }
}

// Helper function to remove a widget and cleanup its resources
export function removeWidget(widgetId: string) {
  settingStore.update((store) => {
    const widget = store.widgets[widgetId];
    if (widget) {
      cleanupWidget(widgetId, widget.type);
      delete store.widgets[widgetId];
    }
    return store;
  });
}

export default settingStore;

// Export span types for use in components
export type { AnalogClockSpan, FlipClockSpan, CalendarSpan, CatSpan };
