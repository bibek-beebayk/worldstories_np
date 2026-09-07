export interface Pagination {
  count: number;
  page: number;
  pages: number;
  previous: string | null;
  next: string | null;
  size: number;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  description: string;
  stories_count: number;
}

export interface Story {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  story_type: string;
  language: string;
  description: string;
  cover_image: string | null;
  is_completed: boolean;
  genres: string[];
}

export interface ChapterMetadata {
  id: number;
  title: string;
  order: number;
  slug: string;
  download_size_bytes?: number;
}

export interface Chapter extends ChapterMetadata {
  content: string;
}

export interface StoryDetail extends Omit<Story, "author" | "genres"> {
  about: string;
  author: { id: number; name: string; bio: string | null; image: string | null } | null;
  genres: Genre[];
  chapter_count: number;
  chapters: ChapterMetadata[];
}

export interface StoryListResponse {
  pagination: Pagination;
  results: Story[];
}
