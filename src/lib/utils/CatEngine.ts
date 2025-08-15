export interface CatImage {
  title: string;
  author: string;
  postUrl: string;
  imageUrl: string | undefined;
  subreddit: string;
}

interface RedditListingResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

interface RedditPost {
  title: string;
  permalink: string;
  url?: string;
  url_overridden_by_dest?: string;
  subreddit: string;
  author: string;
  over_18: boolean;
  is_gallery?: boolean;
}

export class CatEngine {
  private readonly subreddits = [
    "Catswithjobs",
    "catpics",
    "catpictures",
    "catsinboxes",
    "CatsInBusinessAttire",
    "CatsInHats",
  ];

  private readonly magazineKey = "catImageMagazineV1";
  private readonly targetPreload = 5; // how many to keep in magazine
  private readonly initialFill = 5; // on cold start
  private readonly preloadLookahead = 3; // how many upcoming URLs to warm

  // Track which URLs we already asked the browser to preload, to avoid churn
  private readonly preloaded = new Map<string, HTMLImageElement>();

  /**
   * Fetch a random cat image from Reddit
   */
  async fetchRandomCatImage(): Promise<CatImage> {
    const sub =
      this.subreddits[Math.floor(Math.random() * this.subreddits.length)];
    const resp = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=25`,
      { headers: { "User-Agent": "random-image-demo/1.0" } }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data: RedditListingResponse = await resp.json();
    const posts: RedditPost[] = data.data.children.map((c) => c.data);

    // Basic image filters
    const images = posts.filter((p) => {
      const url = p.url_overridden_by_dest || p.url || "";
      const isImageHost =
        /^(https?:)?\/\/(i\.redd\.it|i\.imgur\.com|preview\.redd\.it)/i.test(
          url
        ) || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      const notGallery = !p.is_gallery;
      return !p.over_18 && isImageHost && notGallery;
    });

    if (!images.length) throw new Error("No image posts found.");

    const pick = images[Math.floor(Math.random() * images.length)];
    return {
      title: pick.title,
      postUrl: `https://reddit.com${pick.permalink}`,
      imageUrl: pick.url_overridden_by_dest || pick.url,
      subreddit: pick.subreddit,
      author: pick.author,
    };
  }

  /**
   * Safely fetch one valid image with retries
   */
  private async fetchOneSafe(retries = 3): Promise<CatImage> {
    let lastErr: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        const img = await this.fetchRandomCatImage();
        if (img?.imageUrl) return img;
      } catch (e) {
        lastErr = e;
      }
    }
    throw (lastErr as Error) ?? new Error("Failed to fetch cat image");
  }

  /**
   * Read magazine from localStorage
   */
  private readMagazine(): CatImage[] {
    try {
      const raw = localStorage.getItem(this.magazineKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      // Basic validation
      return arr.filter(
        (x) =>
          x &&
          typeof x.title === "string" &&
          typeof x.author === "string" &&
          typeof x.postUrl === "string" &&
          typeof x.subreddit === "string" &&
          (typeof x.imageUrl === "string" || typeof x.imageUrl === "undefined")
      );
    } catch {
      return [];
    }
  }

  /**
   * Write magazine to localStorage
   */
  private writeMagazine(arr: CatImage[]) {
    try {
      localStorage.setItem(this.magazineKey, JSON.stringify(arr));
    } catch {
      // ignore quota or serialization errors
    }
  }

  /**
   * Fill magazine with N images
   */
  private async fillMagazine(n: number): Promise<CatImage[]> {
    const results: CatImage[] = [];
    for (let i = 0; i < n; i++) {
      const img = await this.fetchOneSafe();
      results.push(img);
    }
    return results;
  }

  /**
   * Top up the magazine asynchronously to maintain preload count
   */
  private async topUpAsync() {
    try {
      // After popping one, we want at least targetPreload items ready.
      let mag = this.readMagazine();
      const need = Math.max(0, this.targetPreload - mag.length);
      for (let i = 0; i < need; i++) {
        const img = await this.fetchOneSafe();
        mag = this.readMagazine(); // re-read in case other tabs updated it
        mag.push(img);
        this.writeMagazine(mag);
      }
      // After topping up, warm the cache for upcoming images
      this.preloadUpcoming();
    } catch {
      // Swallow errors; UX still shows the immediately returned image
    }
  }

  /**
   * Preload next few images by creating Image objects to warm HTTP cache.
   * This is a best-effort, zero-maintenance preloader.
   */
  private preloadUpcoming() {
    const mag = this.readMagazine();
    const nextUrls = mag
      .slice(0, this.preloadLookahead)
      .map((m) => m.imageUrl)
      .filter((u): u is string => !!u);

    // Remove references for URLs that are no longer in our lookahead
    for (const [url, img] of this.preloaded) {
      if (!nextUrls.includes(url)) {
        // Drop our reference; the browser cache retains the resource
        img.onload = null;
        img.onerror = null;
        this.preloaded.delete(url);
      }
    }

    // Add new preloaders for unseen URLs
    for (const url of nextUrls) {
      if (this.preloaded.has(url)) continue;
      try {
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        // Optional: avoid referrer leakage; adjust if you need referers.
        img.referrerPolicy = "no-referrer";
        img.src = url;
        // No need to attach to DOM; request starts immediately.
        this.preloaded.set(url, img);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Get the next cat image from the magazine
   * Returns immediately from cache if available, otherwise fetches new images
   */
  async getNextCatFromMagazine(): Promise<CatImage> {
    let mag = this.readMagazine();

    if (mag.length === 0) {
      // Cold start: fetch initial fill, store, return first
      const filled = await this.fillMagazine(this.initialFill);
      this.writeMagazine(filled);
      const [first, ...rest] = filled;
      this.writeMagazine(rest);
      // Top up and start preloading upcoming images
      void this.topUpAsync(); // fire-and-forget
      // Warm cache for what's currently in rest
      this.preloadUpcoming();
      return first;
    }

    // Pop first and return immediately
    const next = mag.shift()!;
    this.writeMagazine(mag);

    // Preload now for remaining magazine, then top up in background
    this.preloadUpcoming();
    void this.topUpAsync();

    return next;
  }

  /**
   * Clear the magazine cache
   */
  clearMagazine() {
    try {
      localStorage.removeItem(this.magazineKey);
    } catch {
      // ignore errors
    }
    // Drop preloader references
    for (const [, img] of this.preloaded) {
      img.onload = null;
      img.onerror = null;
    }
    this.preloaded.clear();
  }

  /**
   * Get magazine status (for debugging)
   */
  getMagazineStatus() {
    const mag = this.readMagazine();
    return {
      count: mag.length,
      targetPreload: this.targetPreload,
      needsRefill: mag.length < this.targetPreload,
      lookahead: this.preloadLookahead,
      preloadedCount: this.preloaded.size,
    };
  }
}

// Export a singleton instance
export const catEngine = new CatEngine();
