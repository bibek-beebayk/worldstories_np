import { afterEach, describe, expect, it, vi } from "vitest";
import { storyApi } from "./story";
import { apiClient } from "./client";

afterEach(() => vi.unstubAllGlobals());

function mockResponse(body: unknown = {}) {
  const fetchMock = vi.fn().mockImplementation(async () => Response.json(body));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Nepali catalogue API", () => {
  it("scopes every endpoint by the editorial flag without filtering language", async () => {
    const fetchMock = mockResponse();
    await storyApi.getStories({ page: 2, genres: [3, 7], sort: "rating", q: "सिंह & खरायो" });
    await storyApi.getStory("कथा");
    await storyApi.getChapter("कथा", "पहिलो भाग");
    await storyApi.getGenres();
    const urls = fetchMock.mock.calls.map(([url]) => new URL(url));
    for (const url of urls) {
      expect(url.searchParams.get("show_in_nepali_site")).toBe("true");
      expect(url.searchParams.has("language")).toBe(false);
    }
    expect(urls[0].searchParams.get("q")).toBe("सिंह & खरायो");
    expect(urls[0].searchParams.get("page")).toBe("2");
    expect(urls[0].searchParams.get("genres")).toBe("3,7");
    expect(urls[0].searchParams.get("sort")).toBe("rating");
    expect(decodeURIComponent(urls[2].pathname)).toBe("/api/stories/कथा/chapters/पहिलो भाग/");
    expect(urls[2].searchParams.get("type")).toBe("text");
  });

  it("preserves API status codes for route error handling", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(storyApi.getStory("missing")).rejects.toMatchObject({ status: 404 });
  });

  it("explains a misconfigured API URL when the server returns HTML", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html></html>", {
      headers: { "Content-Type": "text/html" },
    })));
    await expect(storyApi.getGenres()).rejects.toThrow("Check VITE_API_URL");
  });

  it("passes cancellation to fetch and returns the API payload", async () => {
    const payload = { pagination: { count: 0 }, results: [] };
    const fetchMock = mockResponse(payload);
    const controller = new AbortController();
    await expect(apiClient("/stories/", { signal: controller.signal })).resolves.toEqual(payload);
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });
});
