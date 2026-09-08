import type { StoryFilters } from "../api/story";

export function catalogueFilters(url: URL): Required<StoryFilters> {
  const page = Number(url.searchParams.get("page") || 1);
  const genre = Number(url.searchParams.get("genre"));
  const sort = url.searchParams.get("sort");
  return {
    q: (url.searchParams.get("q") || "").trim(),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    genres: Number.isSafeInteger(genre) && genre > 0 ? [genre] : [],
    sort: sort === "rating" || sort === "views" ? sort : "recent",
  };
}

export function cataloguePath(filters: Required<StoryFilters>, page: number): string {
  const params = new URLSearchParams({ page: String(page), sort: filters.sort });
  if (filters.q) params.set("q", filters.q);
  if (filters.genres.length) params.set("genre", String(filters.genres[0]));
  return `/kathaharu?${params}`;
}

export function paginationPages(page: number, pages: number): number[] {
  return [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((value) => value >= 1 && value <= pages)
    .sort((a, b) => a - b);
}
