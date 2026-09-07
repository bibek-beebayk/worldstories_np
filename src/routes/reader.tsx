import { Link } from "react-router";
import type { Route } from "./+types/reader";
import { storyApi } from "../api/story";
import CoverImage from "../components/CoverImage";
import SimpleReader from "../components/SimpleReader";
import { genreLabel, nepaliNumber } from "../lib/nepali";
import { chapterPath, storyPath } from "../lib/paths";
import { buildMeta, errorMeta } from "../lib/buildMeta";
import { sanitizeStoryHtml } from "../lib/sanitizeHtml.server";

export async function loader({ params }: Route.LoaderArgs) {
  const story = await storyApi.getStory(params.slug);
  const chapters = [...story.chapters].sort((a, b) => a.order - b.order || a.id - b.id);
  const chapterIndex = params.chapterSlug ? chapters.findIndex((chapter) => chapter.slug === params.chapterSlug) : chapters.length ? 0 : -1;
  if (params.chapterSlug && chapterIndex < 0) throw new Response(null, { status: 404 });
  const selected = chapters[chapterIndex];
  const chapter = selected ? await storyApi.getChapter(story.slug, selected.slug) : null;
  // Return only the fields used by the page. Raw rich text must not leak into hydration data.
  return {
    story: {
      slug: story.slug, title: story.title, author: story.author?.name || null,
      cover_image: story.cover_image, genres: story.genres, language: story.language,
      about: sanitizeStoryHtml(story.about),
    },
    chapters,
    chapter: chapter ? { title: chapter.title, content: sanitizeStoryHtml(chapter.content) } : null,
    chapterIndex,
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  if (!data) return errorMeta();
  const { story, chapter } = data;
  const chapterTitle = params.chapterSlug && chapter ? ` — ${chapter.title}` : "";
  return buildMeta({
    title: `${story.title}${chapterTitle} — विश्वकथा`,
    description: `विश्वकथामा «${story.title}»${chapterTitle} पढ्नुहोस्।${story.author ? ` लेखक: ${story.author}।` : ""} संसारभरिका छानिएका कथाको सङ्ग्रह।`,
    path: params.chapterSlug ? chapterPath(story.slug, params.chapterSlug) : storyPath(story.slug),
    image: story.cover_image,
    type: "article",
    noIndex: !chapter,
  });
}

export default function Reader({ loaderData }: Route.ComponentProps) {
  const { story, chapters, chapter, chapterIndex } = loaderData;
  return (
    <div className="container py-10">
      <Link to="/kathaharu" className="text-sm text-primary underline underline-offset-4">सबै कथामा फर्कनुहोस्</Link>
      <header className="mx-auto mt-8 grid max-w-4xl gap-8 border-b pb-10 sm:grid-cols-[9rem_1fr]">
        <div className="w-32 sm:w-full"><CoverImage src={story.cover_image} title={story.title} /></div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-relaxed">{story.title}</h1>
          <p className="mt-3 text-muted-foreground">{story.author || "लेखक अज्ञात"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {story.genres.map((genre) => <Link key={genre.id} to={`/kathaharu?genre=${genre.id}`} className="rounded-full bg-secondary px-3 py-1 text-sm hover:text-primary">{genreLabel(genre.name)}</Link>)}
          </div>
          {story.about && <div lang={story.language} className="prose prose-sm mt-5 max-w-none text-muted-foreground prose-a:text-primary" dangerouslySetInnerHTML={{ __html: story.about }} />}
        </div>
      </header>
      {chapters.length > 1 && (
        <details className="mx-auto my-8 max-w-3xl rounded-lg border p-4">
          <summary className="cursor-pointer font-medium">अध्यायहरू ({nepaliNumber(chapters.length)})</summary>
          <nav aria-label="अध्यायहरूको सूची" className="mt-4 max-h-72 overflow-y-auto">
            <ol className="space-y-3">
              {chapters.map((item, index) => <li key={item.id}><Link to={`${chapterPath(story.slug, item.slug)}#chapter-content`} aria-current={index === chapterIndex ? "page" : undefined} className={index === chapterIndex ? "font-semibold text-primary" : "hover:text-primary"}>{nepaliNumber(index + 1)}. {item.title}</Link></li>)}
            </ol>
          </nav>
        </details>
      )}
      <SimpleReader storySlug={story.slug} language={story.language} chapter={chapter}
        previous={chapters[chapterIndex - 1]} next={chapters[chapterIndex + 1]} />
    </div>
  );
}
