import type { MetaDescriptor } from "react-router";
import { SITE_URL } from "./site";

interface MetaOptions {
  title: string;
  description: string;
  path?: string | null;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}

// React Router replaces parent metadata, so every route returns a complete set.
export function buildMeta({ title, description, path = "/", image, noIndex = false, type = "website" }: MetaOptions): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: noIndex || !SITE_URL ? "noindex, follow" : "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "विश्वकथा — नेपाली" },
    { property: "og:locale", content: "ne_NP" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (SITE_URL && path !== null) {
    // Only a local path can determine a canonical; never trust the incoming Host header.
    if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Canonical path must be local.");
    const canonical = new URL(path, SITE_URL);
    if (canonical.origin !== SITE_URL) throw new Error("Canonical must remain on the Nepali site.");
    canonical.hash = "";
    tags.push(
      { tagName: "link", rel: "canonical", href: canonical.href },
      { property: "og:url", content: canonical.href },
    );
    let socialImage = `${SITE_URL}/worldstories-logo-min.png`;
    try {
      const candidate = new URL(image || socialImage, SITE_URL);
      if (["https:", "http:"].includes(candidate.protocol)) socialImage = candidate.href;
    } catch { /* Malformed source image URLs use the shared brand image. */ }
    tags.push(
      { property: "og:image", content: socialImage },
      { property: "og:image:alt", content: title },
      { name: "twitter:image", content: socialImage },
      { name: "twitter:image:alt", content: title },
    );
  }
  return tags;
}

export const errorMeta = () => buildMeta({
  title: "पृष्ठ उपलब्ध छैन — विश्वकथा",
  description: "यो पृष्ठ अहिले उपलब्ध छैन। विश्वकथामा अरू कथा पढ्नुहोस्।",
  noIndex: true,
  path: null,
});
