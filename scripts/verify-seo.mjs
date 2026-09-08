import assert from "node:assert/strict";
import handler, { config } from "../.netlify/v1/functions/react-router-server.mjs";
import { fixtureApi } from "./fixtures/catalogue.mjs";

const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = fixtureApi().fetch;
  assert.ok(config.excludedPath.includes("/sitemap.xml"), "Sitemap proxy must bypass SSR");
  const robots = await handler(new Request("https://request-host.example/robots.txt"), {});
  assert.equal(robots.status, 200, "Build with VITE_SITE_URL set before running SEO verification");
  assert.match(robots.headers.get("content-type"), /text\/plain/);
  const sitemap = (await robots.text()).match(/^Sitemap: (.+)$/m)?.[1];
  assert.ok(sitemap);
  const origin = new URL(sitemap).origin;
  assert.notEqual(origin, "https://worldstories.net");
  assert.equal(sitemap, `${origin}/sitemap.xml`);
  for (const [path, canonicalPath, noIndex] of [
    ["/", "/", false],
    ["/kathaharu", "/kathaharu", false],
    ["/kathaharu?q=test", "/kathaharu?q=test", true],
    ["/kathaharu?page=2", "/kathaharu?page=2", false],
    ["/kathaharu?genre=7&sort=rating", "/kathaharu?genre=7&sort=rating", true],
    ["/katha/test-story", "/katha/test-story", false],
    ["/katha/test-story/second", "/katha/test-story/second", false],
  ]) {
    const response = await handler(new Request(`https://request-host.example${path}`), {});
    assert.equal(response.status, 200);
    const html = await response.text();
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
    assert.ok(head);
    const canonical = `${origin}${canonicalPath}`.replaceAll("&", "&amp;");
    assert.ok(head.includes(`rel="canonical" href="${canonical}"`), path);
    assert.equal((head.match(/rel="canonical"/g) || []).length, 1);
    assert.match(head, /property="og:locale" content="ne_NP"/);
    assert.match(head, /property="og:image"/);
    assert.match(head, /name="twitter:image"/);
    assert.ok(head.includes(`name="robots" content="${noIndex ? "noindex" : "index"}, follow"`));
    assert.doesNotMatch(head, /request-host\.example/);
  }
  const error = await handler(new Request("https://request-host.example/katha/missing"), {});
  assert.equal(error.status, 404);
  const errorHead = (await error.text()).match(/<head>([\s\S]*?)<\/head>/)?.[1];
  assert.match(errorHead, /noindex, follow/);
  assert.doesNotMatch(errorHead, /rel="canonical"/);
  console.log("Production SEO: robots, sitemap exclusion, social tags, canonical origin, pagination and errors passed");
} finally {
  globalThis.fetch = originalFetch;
}
