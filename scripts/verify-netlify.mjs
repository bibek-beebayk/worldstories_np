import assert from "node:assert/strict";
import handler, { config } from "../.netlify/v1/functions/react-router-server.mjs";
import { fixtureApi } from "./fixtures/catalogue.mjs";

assert.equal(config.path, "/*");
assert.equal(config.preferStatic, true);
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = fixtureApi().fetch;
  for (const [path, content] of [
    ["/", "कथाले जोडेको संसार"],
    ["/kathaharu", "परीक्षण कथा"],
    ["/katha/test-story/second", "दोस्रो अध्यायको पाठ।"],
  ]) {
    const response = await handler(new Request(`https://nepali.example${path}`), {});
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(content));
  }
  console.log("Generated Netlify function: catch-all routing, homepage, catalogue and chapter SSR passed");
} finally {
  globalThis.fetch = originalFetch;
}
