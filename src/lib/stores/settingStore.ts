import { writable } from "svelte/store";

type Widget = {
  id: string;
  pos: {
    row: number;
    col: number;
  };
};

type AnalogClockWidget = Widget & {
  type: "analog-clock";
  span: {
    x: 1 | 2;
    y: 1 | 2;
  };
  settings: {
    showNumbers: boolean;
    showSecondsHand: boolean;
  };
};

const defaultStore = {
  options: {
    reordering: true,
    wallpaper: "/assets/wallpapers/blobs-l.svg",
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

const settingStore = writable<{
  options: {
    reordering: boolean;
    wallpaper: string;
  };
  wallpapers: string[];
}>(JSON.parse(window.localStorage.getItem("settingStore")!) ?? defaultStore);

let timer: NodeJS.Timeout | null;

settingStore.subscribe((value) => {
  clearTimeout(timer as NodeJS.Timeout);
  timer = setTimeout(() => {
    window.localStorage.setItem("settingStore", JSON.stringify(value));
  }, 1000);
});

export default settingStore;
