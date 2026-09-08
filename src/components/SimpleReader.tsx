import { useReadingAnalytics } from "./AnalyticsTracker";
import { Link } from "react-router";
import type { ChapterMetadata } from "../api/types";
import { chapterPath } from "../lib/paths";

interface SimpleReaderProps {
  storySlug: string;
  language: string;
  // content is sanitized by the server loader before reaching this component.
  chapter: { slug: string; title: string; content: string } | null;
  previous?: ChapterMetadata;
  next?: ChapterMetadata;
}

export default function SimpleReader({ storySlug, language, chapter, previous, next }: SimpleReaderProps) {
  useReadingAnalytics(storySlug, chapter?.slug);
  return (
    <section className="mx-auto max-w-3xl pt-10">
      {chapter ? (
        <article id="chapter-content" lang={language} className="scroll-mt-8">
          <h2 className="mb-8 text-2xl font-bold leading-relaxed">{chapter.title}</h2>
          {chapter.content ? (
            <div className="reader-content prose prose-lg max-w-none break-words text-foreground prose-headings:leading-relaxed prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: chapter.content }} />
          ) : <p className="leading-loose text-muted-foreground">यो अध्यायको सामग्री अहिले उपलब्ध छैन।</p>}
        </article>
      ) : <p className="rounded-lg border border-dashed p-8 leading-loose text-muted-foreground">यो कथा पढ्नका लागि अझै उपलब्ध छैन। केही समयपछि फेरि आउनुहोस्।</p>}
      {chapter && (
        <nav aria-label="अध्याय नेभिगेसन" className="mt-12 grid grid-cols-2 gap-4 border-t pt-6">
          <div>{previous && <Link to={`${chapterPath(storySlug, previous.slug)}#chapter-content`} className="block rounded-lg border p-4 hover:bg-secondary"><span className="text-sm text-muted-foreground">अघिल्लो अध्याय</span><span className="mt-2 block font-medium">{previous.title}</span></Link>}</div>
          <div>{next ? <Link to={`${chapterPath(storySlug, next.slug)}#chapter-content`} className="block rounded-lg border p-4 text-right hover:bg-secondary"><span className="text-sm text-muted-foreground">अर्को अध्याय</span><span className="mt-2 block font-medium">{next.title}</span></Link> : <Link to="/kathaharu" className="block rounded-lg border p-4 text-right font-medium text-primary hover:bg-secondary">अरू कथा पढ्नुहोस्</Link>}</div>
        </nav>
      )}
    </section>
  );
}
