import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { storyApi } from "../api/story";
import StoryCard from "../components/StoryCard";
import { buildMeta, errorMeta } from "../lib/buildMeta";

export async function loader() {
  const stories = await storyApi.getStories();
  return { stories: stories.results.slice(0, 6) };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return errorMeta();
  return buildMeta({
    title: "विश्वकथा — संसारभरिका कथा, नेपालीमा",
    description: "संसारका कुनाकुनाबाट छानिएका कथा नेपालीमा पढ्नुहोस्। लोककथा, साहसिक कथा र नयाँ कथासँगै नयाँ संसार चियाउनुहोस्।",
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <section className="bg-gradient-to-br from-hero-gradient-start to-hero-gradient-end text-primary-foreground">
        <div className="container py-16 sm:py-24">
          <p className="mb-5 text-sm font-medium">विश्वकथा · नेपाली</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-relaxed sm:text-5xl sm:leading-relaxed">कथाले जोडेको संसार</h1>
          <p className="mt-5 max-w-xl text-lg leading-loose opacity-90">कतै सुनेका, कतै नसुनेका। संसारका कुनाकुनाबाट छानिएका कथा पढौँ, नयाँ संसार चियाऔँ।</p>
          <Link to="/kathaharu" className="mt-8 inline-flex items-center gap-3 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
            कथाहरू पढ्नुहोस् <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="container pt-12" aria-labelledby="latest-heading">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 id="latest-heading" className="text-2xl font-bold">भर्खर थपिएका कथा</h2>
          <Link to="/kathaharu" className="text-sm font-medium text-primary underline underline-offset-4">सबै कथा हेर्नुहोस्</Link>
        </div>
        {loaderData.stories.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {loaderData.stories.map((story) => <StoryCard key={story.id} story={story} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-8 leading-loose text-muted-foreground">कथाको सङ्ग्रह तयार हुँदैछ। नयाँ कथा पढ्न फेरि आउनुहोस्।</p>
        )}
      </section>
    </>
  );
}
