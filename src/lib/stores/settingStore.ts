import { writable } from "svelte/store";

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
