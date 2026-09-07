import { afterEach, describe, expect, it, vi } from "vitest";
import { siteOrigin } from "./site";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

async function configuredMeta(value: string) {
  vi.stubEnv("VITE_SITE_URL", value);
  vi.resetModules();
  return import("./buildMeta");
}

describe("Nepali SEO metadata", () => {
  it("emits a complete social tag set and a canonical on this site's configured origin", async () => {
    const { buildMeta } = await configuredMeta("https://nepali.example/");
    const tags = buildMeta({ title: "कथा", description: "कथा पढ्नुहोस्।", path: "/katha/test/second" });
    expect(tags).toContainEqual({ tagName: "link", rel: "canonical", href: "https://nepali.example/katha/test/second" });
    expect(tags).toContainEqual({ property: "og:locale", content: "ne_NP" });
    expect(tags).toContainEqual({ name: "twitter:description", content: "कथा पढ्नुहोस्।" });
    expect(tags).toContainEqual({ property: "og:image", content: "https://nepali.example/worldstories-logo-min.png" });
    expect(() => buildMeta({ title: "कथा", description: "", path: "//worldstories.net/story/test" })).toThrow();
  });

  it("does not invent a canonical domain on an unconfigured build", async () => {
    const { buildMeta } = await configuredMeta("");
    const tags = buildMeta({ title: "कथा", description: "" });
    expect(tags).toContainEqual({ name: "robots", content: "noindex, follow" });
    expect(tags.some((tag) => "rel" in tag && tag.rel === "canonical")).toBe(false);
  });

  it("excludes error pages from indexing without canonicalizing them to the homepage", async () => {
    const { errorMeta } = await configuredMeta("https://nepali.example");
    const tags = errorMeta();
    expect(tags).toContainEqual({ name: "robots", content: "noindex, follow" });
    expect(tags.some((tag) => "rel" in tag && tag.rel === "canonical")).toBe(false);
  });

  it("rejects parent-site origins and non-origin configuration", () => {
    for (const value of ["https://worldstories.net", "https://www.worldstories.net", "https://nepali.example/path", "https://user:pass@nepali.example", "javascript:alert(1)"]) {
      expect(() => siteOrigin(value)).toThrow();
    }
  });

  it("publishes robots with only this site's sitemap when configured", async () => {
    await configuredMeta("https://nepali.example");
    const { loader } = await import("../routes/robots");
    const response = loader();
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Sitemap: https://nepali.example/sitemap.xml");
  });

  it("returns 503 from robots until the site's origin is configured", async () => {
    await configuredMeta("");
    const { loader } = await import("../routes/robots");
    const response = loader();
    expect(response.status).toBe(503);
    expect(await response.text()).toContain("Disallow: /");
  });
});
