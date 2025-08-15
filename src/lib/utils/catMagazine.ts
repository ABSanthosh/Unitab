// Your existing function imported here
import { getRandomImageFromSubreddit as fetchOne } from "./redditCat";

// redditCatMagazine.ts
export interface CatImage {
  title: string;
  author: string;
  postUrl: string;
  imageUrl: string | undefined;
  subreddit: string;
}

const MAG_KEY = "catImageMagazineV1";
const MAG_TARGET_PRELOAD = 5; // keep this many ready after returning 1
const INITIAL_FILL = 5; // on empty, fetch 3

function readMag(): CatImage[] {
  try {
    const raw = localStorage.getItem(MAG_KEY);
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

function writeMag(arr: CatImage[]) {
  try {
    localStorage.setItem(MAG_KEY, JSON.stringify(arr));
  } catch {
    // ignore quota or serialization errors
  }
}

// Helper: safely fetch one valid image (retry a few times)
async function fetchOneSafe(retries = 3): Promise<CatImage> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const img = await fetchOne();
      if (img?.imageUrl) return img;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Failed to fetch cat image");
}

// Fill magazine with N images
async function fillMagazine(n: number): Promise<CatImage[]> {
  const results: CatImage[] = [];
  for (let i = 0; i < n; i++) {
    const img = await fetchOneSafe();
    results.push(img);
  }
  return results;
}

/**
 * Return the next image immediately from the magazine.
 * - If empty, prefill with INITIAL_FILL and return the first.
 * - After returning one, asynchronously top up by 1 to maintain MAG_TARGET_PRELOAD.
 */
export async function getNextCatFromMagazine(): Promise<CatImage> {
  let mag = readMag();

  if (mag.length === 0) {
    // Cold start: fetch 3, store, return first
    const filled = await fillMagazine(INITIAL_FILL);
    writeMag(filled);
    const [first, ...rest] = filled;
    writeMag(rest);
    // Top up to keep MAG_TARGET_PRELOAD ready after returning one
    void topUpAsync(); // fire-and-forget
    return first;
  }

  // Pop first and return immediately
  const next = mag.shift()!;
  writeMag(mag);

  // Top up in the background to maintain preload
  void topUpAsync();

  return next;
}

async function topUpAsync() {
  try {
    // After popping one, we want at least MAG_TARGET_PRELOAD items ready.
    let mag = readMag();
    const need = Math.max(0, MAG_TARGET_PRELOAD - mag.length);
    for (let i = 0; i < need; i++) {
      const img = await fetchOneSafe();
      mag = readMag(); // re-read in case other tabs updated it
      mag.push(img);
      writeMag(mag);
    }
  } catch {
    // Swallow errors; UX still shows the immediately returned image
  }
}
