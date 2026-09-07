import assert from "node:assert/strict";
import { createRequestHandler } from "react-router";
import * as build from "../build/server/index.js";
import { fixtureApi } from "./fixtures/catalogue.mjs";

const handler = createRequestHandler({ ...build, handleError() {} }, "production");
const originalFetch = globalThis.fetch;
async function render(path, options = {}, userAgent = "Mozilla/5.0") {
  const api = fixtureApi(options);
  globalThis.fetch = api.fetch;
  const response = await handler(new Request(`https://nepali.example${path}`, { headers: { "User-Agent": userAgent } }));
  const html = await response.text();
  return { response, html, calls: api.calls };
}

try {
  for (const userAgent of ["Mozilla/5.0", "Googlebot"]) {
    const home = await render("/", {}, userAgent);
    assert.equal(home.response.status, 200);
    assert.match(home.html, /<html lang="ne">/);
    assert.match(home.html, /कथाले जोडेको संसार/);
    assert.match(home.html, /परीक्षण कथा/);
    assert.match(home.html, /href="\/katha\/test-story"/);
    assert.match(home.html, /https:\/\/worldstories.net/);
    assert.match(home.html, /__reactRouterContext/);

    const catalogue = await render("/kathaharu?genre=7&sort=rating&page=2", {}, userAgent);
    assert.equal(catalogue.response.status, 200);
    assert.match(catalogue.html, /दोस्रो पृष्ठको कथा/);
    assert.match(catalogue.html, /लोककथा/);
    assert.match(catalogue.html, /aria-current="page"/);
    assert.match(catalogue.html, /page=3&amp;sort=rating&amp;genre=7/);
    const list = catalogue.calls.find((url) => url.pathname === "/api/stories/");
    assert.equal(list.searchParams.get("page"), "2");
    assert.equal(list.searchParams.get("genres"), "7");
    assert.equal(list.searchParams.get("sort"), "rating");
    assert.doesNotMatch(catalogue.html, /value="popular"/);

    const reader = await render("/katha/test-story", {}, userAgent);
    assert.equal(reader.response.status, 200);
    assert.match(reader.html, /पहिलो अध्यायको पाठ।/);
    assert.doesNotMatch(reader.html, /दोस्रो अध्यायको पाठ।/);
    assert.match(reader.html, /कथाको परिचय।/);
    assert.match(reader.html, /test-story\/second#chapter-content/);
    assert.doesNotMatch(reader.html, /unsafeAbout|unsafeImage|unsafeUrl|unsafeChapter|onerror=|javascript:/);
    assert.equal(reader.calls.filter((url) => url.pathname.includes("/chapters/")).length, 1);
    assert.ok(reader.calls.some((url) => url.pathname.endsWith("/chapters/first/")));

    const second = await render("/katha/test-story/second", {}, userAgent);
    assert.equal(second.response.status, 200);
    assert.match(second.html, /दोस्रो अध्यायको पाठ।/);
    assert.match(second.html, /अघिल्लो अध्याय/);
    assert.match(second.html, /test-story\/first#chapter-content/);
    assert.doesNotMatch(second.html, /unsafeChapter/);
    console.log(`${userAgent}: home, filtered catalogue, first chapter and next chapter SSR passed`);
  }

  const emptyHome = await render("/", { empty: true });
  assert.equal(emptyHome.response.status, 200);
  assert.match(emptyHome.html, /कथाको सङ्ग्रह तयार हुँदैछ/);
  const emptyCatalogue = await render("/kathaharu?genre=7", { empty: true });
  assert.equal(emptyCatalogue.response.status, 200);
  assert.match(emptyCatalogue.html, /कुनै कथा भेटिएन/);
  assert.doesNotMatch(emptyCatalogue.html, /aria-label="कथाका पृष्ठहरू"/);
  const noChapters = await render("/katha/no-chapters");
  assert.equal(noChapters.response.status, 200);
  assert.match(noChapters.html, /यो कथा पढ्नका लागि अझै उपलब्ध छैन/);
  assert.ok(noChapters.calls.every((url) => !url.pathname.includes("/chapters/")));

  for (const path of ["/katha/missing", "/katha/test-story/missing", "/kathaharu?page=99", "/missing"]) {
    const missing = await render(path);
    assert.equal(missing.response.status, 404);
    assert.match(missing.html, /यो पृष्ठ भेटिएन/);
  }
  const failure = await render("/kathaharu", { status: 503 });
  assert.equal(failure.response.status, 503);
  assert.match(failure.html, /पृष्ठ खोल्न सकिएन/);
  console.log("Empty catalogues, stories without chapters, 404s, and API failure status passed");
} finally {
  globalThis.fetch = originalFetch;
}
