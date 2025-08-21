import { fetchTodaysAPOD, type APODResponse } from "../utils/NASA/APOD";
import settingStore from "../stores/settingStore";
import { get } from "svelte/store";

/**
 * Wallpaper manager to handle different wallpaper types
 */
export class WallpaperManager {
  /**
   * Updates NASA APOD wallpaper if currently selected
   */
  static async updateNASAWallpaper(): Promise<boolean> {
    const currentSettings = get(settingStore);
    
    if (currentSettings.options.wallpaper.type !== "nasa") {
      return false;
    }

    try {
      const apodData = await fetchTodaysAPOD(currentSettings.options.wallpaper.apiKey);
      
      // Only update if it's an image
      if (apodData.media_type === "image") {
        settingStore.update((store) => {
          if (store.options.wallpaper.type === "nasa") {
            store.options.wallpaper.url = apodData.hdurl || apodData.url;
          }
          return store;
        });
        return true;
      }
    } catch (error) {
      console.error("Failed to update NASA wallpaper:", error);
    }

    return false;
  }

  /**
   * Sets up periodic updates for NASA wallpapers
   * @param intervalHours - How often to check for updates (default: 6 hours)
   */
  static setupAutoUpdate(intervalHours: number = 6): NodeJS.Timeout {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    return setInterval(async () => {
      await this.updateNASAWallpaper();
    }, intervalMs);
  }

  /**
   * Gets the current wallpaper URL based on settings
   */
  static getCurrentWallpaperUrl(): string {
    const currentSettings = get(settingStore);
    return currentSettings.options.wallpaper.url;
  }

  /**
   * Checks if the current wallpaper is a NASA APOD
   */
  static isNASAWallpaper(): boolean {
    const currentSettings = get(settingStore);
    return currentSettings.options.wallpaper.type === "nasa";
  }
}

// Initialize auto-update when module loads
let autoUpdateInterval: NodeJS.Timeout | null = null;

// Set up auto-update for NASA wallpapers
export function initializeWallpaperManager() {
  // Update immediately if NASA wallpaper is selected
  const currentSettings = get(settingStore);
  if (currentSettings.options.wallpaper.type === "nasa") {
    WallpaperManager.updateNASAWallpaper();
  }

  // Set up periodic updates
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
  }
  autoUpdateInterval = WallpaperManager.setupAutoUpdate(6); // Update every 6 hours
}

// Clean up on module unload
export function cleanupWallpaperManager() {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = null;
  }
}
