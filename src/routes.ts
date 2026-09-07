import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("components/SiteLayout.tsx", [
    index("routes/home.tsx"),
    route("kathaharu", "routes/catalogue.tsx"),
    route("katha/:slug/:chapterSlug?", "routes/reader.tsx"),
  ]),
] satisfies RouteConfig;
