// Pulls the latest uploads from the Seika Racing YouTube channel at build time.
// Falls back to videos-fallback.json when offline so the build never breaks.
import { readFile } from "node:fs/promises";
import site from "./site.json" with { type: "json" };

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${site.social.youtubeChannelId}`;

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return m ? m[1] : "";
}
function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function fallback() {
  const raw = await readFile(new URL("./videos-fallback.json", import.meta.url), "utf8");
  return JSON.parse(raw);
}

export default async function () {
  try {
    const res = await fetch(FEED, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`YouTube feed responded ${res.status}`);
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    const videos = entries.map((e) => {
      const id = pick(e, "yt:videoId");
      const link = (e.match(/<link rel="alternate" href="([^"]+)"/) || [])[1] || `https://www.youtube.com/watch?v=${id}`;
      return {
        id,
        title: decode(pick(e, "title")),
        url: link,
        published: pick(e, "published"),
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        isShort: link.includes("/shorts/"),
      };
    }).filter((v) => v.id);
    if (!videos.length) throw new Error("Feed had no entries");
    return videos;
  } catch (err) {
    console.warn(`[videos] ${err.message}; using fallback list`);
    return fallback();
  }
}
