export interface CatImage {
  title: string;
  author: string;
  postUrl: string;
  imageUrl: string | undefined;
  subreddit: string;
}
export async function getRandomImageFromSubreddit(): Promise<CatImage> {
  const subs = [
    "Catswithjobs",
    "catpics",
    "catpictures",
    "catsinboxes",
    "CatsInBusinessAttire",
    "CatsInHats",
    "funnycats",
  ];
  const sub = subs[Math.floor(Math.random() * subs.length)];
  const resp = await fetch(
    `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=100`,
    { headers: { "User-Agent": "random-image-demo/1.0" } }
  );
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
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
  }

  const data: RedditListingResponse = await resp.json();
  const posts: RedditPost[] = data.data.children.map((c) => c.data);

  // Basic image filters
  const images = posts.filter((p) => {
    const url = p.url_overridden_by_dest || p.url || "";
    const isImageHost =
      /^(https?:)?\/\/(i\.redd\.it|i\.imgur\.com|preview\.redd\.it)/i.test(
        url
      ) || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    return !p.over_18 && isImageHost;
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

// Example usage:
// getRandomImageFromSubreddit("EarthPorn").then(console.log).catch(console.error);
