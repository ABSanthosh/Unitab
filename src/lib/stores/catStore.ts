import { writable, derived } from "svelte/store";
import { catEngine, type CatImage } from "../utils/CatEngine";

interface CatImageCache {
  [widgetId: string]: {
    image: CatImage;
    timestamp: number;
    isLoading: boolean;
    error?: string;
  };
}

interface CatStore {
  cache: CatImageCache;
  globalLoading: boolean;
  lastFetchTime: number;
}

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

const defaultCatStore: CatStore = {
  cache: {},
  globalLoading: false,
  lastFetchTime: 0,
};

const STORAGE_KEY = "catStoreV1";

// Load initial state from localStorage
function loadFromStorage(): CatStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultCatStore;
    
    const parsed = JSON.parse(stored);
    // Validate the structure
    if (typeof parsed === 'object' && parsed.cache && typeof parsed.cache === 'object') {
      return {
        cache: parsed.cache || {},
        globalLoading: false, // Never persist loading state
        lastFetchTime: parsed.lastFetchTime || 0,
      };
    }
  } catch (error) {
    console.warn("Failed to load cat store from localStorage:", error);
  }
  return defaultCatStore;
}

const catStore = writable<CatStore>(loadFromStorage());

let saveTimer: NodeJS.Timeout | null = null;

// Auto-save to localStorage with debouncing
catStore.subscribe((value) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const toSave = {
        cache: value.cache,
        lastFetchTime: value.lastFetchTime,
        // Don't save globalLoading as it should always start as false
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.warn("Failed to save cat store to localStorage:", error);
    }
  }, 500);
});

// Derived store for individual widget states
export const catImageStates = derived(catStore, ($catStore) => $catStore.cache);

// Derived store for global loading state
export const globalCatLoading = derived(catStore, ($catStore) => $catStore.globalLoading);

// Helper function to check if cached image is expired
function isCacheExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_EXPIRATION;
}

// Actions
export const catStoreActions = {
  /**
   * Get or fetch a cat image for a specific widget
   */
  async getCatImage(widgetId: string, forceRefresh = false): Promise<CatImage> {
    return new Promise((resolve, reject) => {
      catStore.update(store => {
        const cached = store.cache[widgetId];
        
        // Return cached image if it exists and is not expired (unless forced refresh)
        if (!forceRefresh && cached && !isCacheExpired(cached.timestamp) && cached.image.imageUrl) {
          resolve(cached.image);
          return store;
        }

        // Set loading state
        store.cache[widgetId] = {
          ...cached,
          isLoading: true,
          error: undefined,
        };

        store.globalLoading = Object.values(store.cache).some(item => item.isLoading);
        
        return store;
      });

      // Fetch new image
      catEngine.getNextCatFromMagazine()
        .then((image) => {
          catStore.update(store => {
            store.cache[widgetId] = {
              image,
              timestamp: Date.now(),
              isLoading: false,
              error: undefined,
            };
            store.lastFetchTime = Date.now();
            store.globalLoading = Object.values(store.cache).some(item => item.isLoading);
            return store;
          });
          resolve(image);
        })
        .catch((error) => {
          catStore.update(store => {
            store.cache[widgetId] = {
              ...store.cache[widgetId],
              isLoading: false,
              error: error.message || "Failed to fetch cat image",
            };
            store.globalLoading = Object.values(store.cache).some(item => item.isLoading);
            return store;
          });
          reject(error);
        });
    });
  },

  /**
   * Refresh a specific widget's cat image
   */
  async refreshCatImage(widgetId: string): Promise<CatImage> {
    return this.getCatImage(widgetId, true);
  },

  /**
   * Remove a widget from the cache (when widget is deleted)
   */
  removeCatImage(widgetId: string) {
    catStore.update(store => {
      delete store.cache[widgetId];
      store.globalLoading = Object.values(store.cache).some(item => item.isLoading);
      return store;
    });
  },

  /**
   * Clear all cached images
   */
  clearAllCachedImages() {
    catStore.update(store => {
      store.cache = {};
      store.globalLoading = false;
      return store;
    });
    // Also clear the magazine cache
    catEngine.clearMagazine();
  },

  /**
   * Get the current cache status for a widget
   */
  getCacheStatus(widgetId: string) {
    let status: { exists: boolean; expired: boolean; isLoading: boolean; error?: string } = {
      exists: false,
      expired: false,
      isLoading: false,
    };

    catStore.subscribe(store => {
      const cached = store.cache[widgetId];
      if (cached) {
        status = {
          exists: true,
          expired: isCacheExpired(cached.timestamp),
          isLoading: cached.isLoading,
          error: cached.error,
        };
      }
    })(); // Immediately unsubscribe after reading

    return status;
  },

  /**
   * Preload images for better performance
   */
  async preloadImages(count = 3) {
    catStore.update(store => {
      store.globalLoading = true;
      return store;
    });

    try {
      const promises = Array.from({ length: count }, () => catEngine.getNextCatFromMagazine());
      await Promise.all(promises);
    } catch (error) {
      console.warn("Failed to preload cat images:", error);
    } finally {
      catStore.update(store => {
        store.globalLoading = false;
        return store;
      });
    }
  },

  /**
   * Get magazine status for debugging
   */
  getMagazineStatus() {
    return catEngine.getMagazineStatus();
  },
};

export default catStore;
