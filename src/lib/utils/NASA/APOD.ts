// Define the APOD response type
export interface ApodResponse {
  date: string; // e.g. "2025-08-18"
  explanation: string;
  hdurl?: string; // only present if media_type === "image"
  media_type: "image" | "video";
  service_version: string; // e.g. "v1"
  title: string;
  url: string; // image or video URL
}

// Function to fetch APOD
export async function fetchApod(
  apiKey: string,
  date?: string
): Promise<ApodResponse> {
  const base = "https://api.nasa.gov/planetary/apod";
  const params = new URLSearchParams({ api_key: apiKey });
  if (date) params.set("date", date); // optional YYYY-MM-DD

  const res = await fetch(`${base}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`APOD request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ApodResponse;
  return data;
}
