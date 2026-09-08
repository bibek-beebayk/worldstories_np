import { apiClient } from "./client";
import type { Chapter, Genre, StoryDetail, StoryListResponse } from "./types";

export interface StoryFilters {
  page?: number;
  q?: string;
  genres?: number[];
  sort?: "recent" | "rating" | "views";
}

const selection = "show_in_nepali_site=true";

export const storyApi = {
  getStories: ({ page = 1, genres = [], sort = "recent", q = "" }: StoryFilters = {}) => {
    const params = new URLSearchParams(selection);
    params.set("page", String(page));
    params.set("genres", genres.join(","));
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    return apiClient<StoryListResponse>(`/stories/?${params}`);
  },
  getStory: (slug: string) =>
    apiClient<StoryDetail>(`/stories/${encodeURIComponent(slug)}/?${selection}`),
  // The backend requires type=text; omitting it returns HTTP 400.
  getChapter: (storySlug: string, chapterSlug: string) =>
    apiClient<Chapter>(`/stories/${encodeURIComponent(storySlug)}/chapters/${encodeURIComponent(chapterSlug)}/?type=text&${selection}`),
  getGenres: () => apiClient<Genre[]>(`/genres/?${selection}`),
};
