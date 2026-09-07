import sanitizeHtml from "sanitize-html";

// Run in loaders: neither unsafe source HTML nor the sanitizer enters the client bundle.
// Keep prose, illustrations, footnotes and tables, without scripts, forms or inline styles.
export function sanitizeStoryHtml(html: string | null | undefined): string {
  return sanitizeHtml(html || "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      "*": ["id", "lang", "dir", "title"],
      a: ["href", "name"],
      img: ["src", "alt", "width", "height"],
      ol: ["start", "type"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: { h1: "h2" },
  });
}
