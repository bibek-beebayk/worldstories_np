// Synthetic verification fixtures only; no content is copied into the application.
const genre = { id: 7, name: "Folklore", slug: "folklore", description: "", stories_count: 3 };
const card = {
  id: 1, slug: "test-story", title: "परीक्षण कथा", author: "परीक्षण लेखक", story_type: "Story",
  language: "ne", description: "", cover_image: null, is_completed: true, genres: ["Folklore"],
};
const chapters = [
  { id: 2, slug: "second", title: "दोस्रो अध्याय", order: 2 },
  { id: 1, slug: "first", title: "पहिलो अध्याय", order: 1 },
];
const detail = {
  ...card, author: { id: 1, name: card.author }, genres: [genre], chapters, chapter_count: 2,
  about: '<p>कथाको परिचय।</p><script>unsafeAbout()</script>',
};

export function fixtureApi({ empty = false, status = 200 } = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (input) => {
      const url = new URL(input);
      calls.push(url);
      if (url.searchParams.get("show_in_nepali_site") !== "true") throw new Error("Missing editorial selection");
      if (url.searchParams.has("language")) throw new Error("Unexpected language filtering");
      if (status !== 200) return Response.json({ detail: "Unavailable" }, { status });
      if (url.pathname === "/api/genres/") return Response.json(empty ? [] : [genre]);
      if (url.pathname === "/api/stories/") {
        const page = Number(url.searchParams.get("page") || 1);
        if (page > 3) return Response.json({ detail: "Invalid page" }, { status: 404 });
        return Response.json({
          pagination: { count: empty ? 0 : 3, page, pages: empty ? 1 : 3, size: 1, next: null, previous: null },
          results: empty ? [] : [{ ...card, title: page === 2 ? "दोस्रो पृष्ठको कथा" : card.title }],
        });
      }
      if (url.pathname === "/api/stories/test-story/") return Response.json(detail);
      if (url.pathname === "/api/stories/no-chapters/") return Response.json({ ...detail, slug: "no-chapters", chapters: [], chapter_count: 0 });
      if (url.pathname.startsWith("/api/stories/test-story/chapters/")) {
        if (url.searchParams.get("type") !== "text") throw new Error("Missing chapter type");
        const slug = url.pathname.split("/").at(-2);
        const chapter = chapters.find((item) => item.slug === slug);
        if (chapter) return Response.json({ ...chapter, content: `<p>${slug === "first" ? "पहिलो अध्यायको पाठ।" : "दोस्रो अध्यायको पाठ।"}</p><img src="https://example.com/a.jpg" onerror="unsafeImage()"><a href="javascript:unsafeUrl()">लिङ्क</a><script>unsafeChapter()</script>` });
      }
      return Response.json({ detail: "Not found" }, { status: 404 });
    },
  };
}
