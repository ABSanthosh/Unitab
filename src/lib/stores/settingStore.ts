import { writable } from "svelte/store";
import { SupportedCityName } from "../utils/timezone";

type Widget = {
  id: string;
  pos: {
    row: number;
    col: number;
  };
};

// Define valid span combinations for each widget type
type AnalogClockSpan = 
  | { x: 1; y: 1 }  // Small widget
  | { x: 2; y: 2 }; // Large widget

type FlipClockSpan = 
  | { x: 2; y: 1 }  // Compact widget
  | { x: 2; y: 2 }; // Large widget

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

interface SettingStore {
  options: {
    isDraggable: boolean;
    isResizable: boolean;
    wallpaper: string;
    showGrid: boolean;
  };
  widgets: Record<string, AnalogClockWidget | FlipClockWidget>;
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
        city: "New York",
      },
    },
    "flip-clock-1": {
      id: "flip-clock-1",
      pos: { row: 1, col: 3 },
      type: "flip-clock",
      span: { x: 2, y: 1 },
      settings: {
        showSeconds: true,
        city: "Tokyo",
      },
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

export default settingStore;

// Export span types for use in components
export type { AnalogClockSpan, FlipClockSpan };
