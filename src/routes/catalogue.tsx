import { Fragment } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/catalogue";
import { storyApi } from "../api/story";
import StoryCard from "../components/StoryCard";
import { catalogueFilters, cataloguePath, paginationPages } from "../lib/catalogue";
import { genreLabel, nepaliNumber } from "../lib/nepali";

export async function loader({ request }: Route.LoaderArgs) {
  const filters = catalogueFilters(new URL(request.url));
  const [stories, genres] = await Promise.all([storyApi.getStories(filters), storyApi.getGenres()]);
  return { stories, genres, filters };
}

export function meta() {
  return [{ title: "कथाहरू — विश्वकथा" }];
}

export default function Catalogue({ loaderData }: Route.ComponentProps) {
  const { stories, genres, filters } = loaderData;
  const { pagination } = stories;
  const pages = paginationPages(pagination.page, pagination.pages);
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">कथाहरू</h1>
      <p className="mt-3 leading-loose text-muted-foreground">आफूलाई मन पर्ने कथा छान्नुहोस् र पढ्न थाल्नुहोस्।</p>
      <Form method="get" action="/kathaharu" key={`${filters.genres[0]}-${filters.sort}`} className="my-8 flex flex-wrap items-end gap-4 rounded-lg border bg-card p-5">
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto">
          <label htmlFor="genre" className="text-sm font-medium">विधा</label>
          <select id="genre" name="genre" defaultValue={filters.genres[0] || ""} className="w-full rounded-md border bg-background px-3 py-2 sm:w-64">
            <option value="">सबै विधा</option>
            {filters.genres[0] && !genres.some((genre) => genre.id === filters.genres[0]) && (
              <option value={filters.genres[0]}>चयन गरिएको विधा</option>
            )}
            {genres.map((genre) => <option key={genre.id} value={genre.id}>{genreLabel(genre.name)} ({nepaliNumber(genre.stories_count)})</option>)}
          </select>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <label htmlFor="sort" className="text-sm font-medium">क्रम</label>
          <select id="sort" name="sort" defaultValue={filters.sort} className="rounded-md border bg-background px-3 py-2">
            <option value="recent">नयाँ पहिले</option>
            <option value="rating">उच्च मूल्याङ्कन पहिले</option>
            <option value="views">धेरै हेरिएका पहिले</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground hover:opacity-90">कथा खोज्नुहोस्</button>
        {filters.genres.length > 0 && <Link to="/kathaharu" className="px-2 py-2 text-sm text-primary underline">सबै कथा हेर्नुहोस्</Link>}
      </Form>
      <p className="mb-6 text-sm text-muted-foreground">{nepaliNumber(pagination.count)} कथा</p>
      {stories.results.length ? (
        <section aria-label="कथाको सूची" className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stories.results.map((story) => <StoryCard key={story.id} story={story} />)}
        </section>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center leading-loose">
          <h2 className="text-xl font-semibold">कुनै कथा भेटिएन।</h2>
          <p className="mt-2 text-muted-foreground">{filters.genres.length ? "अर्को विधा छानेर हेर्नुहोस्।" : "कथाको सङ्ग्रह तयार हुँदैछ। केही समयपछि फेरि आउनुहोस्।"}</p>
        </div>
      )}
      {pagination.pages > 1 && (
        <nav aria-label="कथाका पृष्ठहरू" className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {pagination.page > 1 && <Link to={cataloguePath(filters, pagination.page - 1)} className="rounded-md border px-3 py-2">अघिल्लो</Link>}
          {pages.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && page - pages[index - 1] > 1 && <span aria-hidden="true" className="px-1">…</span>}
              <Link to={cataloguePath(filters, page)} aria-label={`पृष्ठ ${nepaliNumber(page)}`} aria-current={page === pagination.page ? "page" : undefined}
                className={`rounded-md border px-4 py-2 ${page === pagination.page ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{nepaliNumber(page)}</Link>
            </Fragment>
          ))}
          {pagination.page < pagination.pages && <Link to={cataloguePath(filters, pagination.page + 1)} className="rounded-md border px-3 py-2">अर्को</Link>}
        </nav>
      )}
    </div>
  );
}
