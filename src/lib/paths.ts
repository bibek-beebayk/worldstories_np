export const storyPath = (slug: string) => `/katha/${encodeURIComponent(slug)}`;

export const chapterPath = (storySlug: string, chapterSlug: string) =>
  `${storyPath(storySlug)}/${encodeURIComponent(chapterSlug)}`;
