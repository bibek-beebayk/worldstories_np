import { describe, expect, it } from "vitest";
import { catalogueFilters, cataloguePath, paginationPages } from "./catalogue";

describe("catalogue navigation", () => {
  it("rejects invalid page/genre numbers and never forwards the broken popular sort", () => {
    for (const page of ["-1", "0", "1.5", "NaN", "Infinity", "99999999999999999999"]) {
      expect(catalogueFilters(new URL(`https://example.com/?page=${page}&genre=-3&sort=popular`)))
        .toEqual({ page: 1, genres: [], sort: "recent", q: "" });
    }
  });

  it("preserves the selected genre and sort across page links", () => {
    const filters = catalogueFilters(new URL("https://example.com/?page=2&genre=7&sort=views"));
    const next = new URL(cataloguePath(filters, 3), "https://example.com");
    expect(catalogueFilters(next)).toEqual({ page: 3, genres: [7], sort: "views", q: "" });
  });

  it("preserves Nepali search text and reserved characters while changing pages", () => {
    const q = "सिंह & खरायो + कथा";
    const filters = catalogueFilters(new URL(`https://example.com/?q=${encodeURIComponent(`  ${q}  `)}&genre=7&sort=rating`));
    expect(filters.q).toBe(q);
    const next = new URL(cataloguePath(filters, 2), "https://example.com");
    expect(catalogueFilters(next)).toEqual({ page: 2, genres: [7], sort: "rating", q });
  });

  it("keeps pagination bounded for a large catalogue and handles both ends", () => {
    expect(paginationPages(50, 100)).toEqual([1, 49, 50, 51, 100]);
    expect(paginationPages(1, 2)).toEqual([1, 2]);
    expect(paginationPages(100, 100)).toEqual([1, 99, 100]);
    expect(paginationPages(1, 0)).toEqual([]);
  });
});
