import { Link } from "react-router";
import type { Story } from "../api/types";
import { genreLabel } from "../lib/nepali";
import { storyPath } from "../lib/paths";
import CoverImage from "./CoverImage";

export default function StoryCard({ story }: { story: Story }) {
  return (
    <article className="min-w-0">
      <Link to={storyPath(story.slug)} className="group block rounded-lg">
        <CoverImage src={story.cover_image} title={story.title} />
        <h3 className="mb-1 mt-4 line-clamp-2 text-lg font-semibold group-hover:text-primary">{story.title}</h3>
        {/* <p className="text-sm text-muted-foreground">{story.author || "लेखक अज्ञात"}</p>
        {story.genres?.[0] && (
          <span className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
            {genreLabel(story.genres[0])}
          </span>
        )} */}
      </Link>
    </article>
  );
}
