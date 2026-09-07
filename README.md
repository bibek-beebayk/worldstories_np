# WorldStories Nepali

Standalone companion frontend in the existing sibling-directory layout. Uses the
same Django API as `worldstories_f`; stories are selected by
`show_in_nepali_site=true`, regardless of their language. No backend or content copy.

Requires Node.js 22 and npm. From this directory:

```sh
npm ci
cp .env.example .env
npm run dev
```

Development runs at http://localhost:8081. `VITE_API_URL` must include `/api` and is
read at build time; rebuild after changing it. The optional `SSR_INTERNAL_API_KEY`
is a server environment variable and must match the backend setting. Never put it
in a `VITE_` variable.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:ssr
npm start
```

The production Node server defaults to port 3000 (`PORT` overrides it). React Router
streams server-rendered HTML and hydrates it in the browser, using the parent
frontend's bot-aware server entry. Netlify builds also generate an SSR function
through `@netlify/vite-plugin-react-router`.

`src/api/client.ts`, `story.ts` and `types.ts` follow the parent API module layout.
The four read endpoints are story list, story detail, text chapter detail, and
genres. Each includes the editorial selection flag; chapter requests also include
the backend-required `type=text`. Detail metadata intentionally has no chapter
body. Reader loaders sanitize chapter HTML and the story introduction with `sanitize-html`
on the server before returning data to the page. Raw chapter HTML and the sanitizer
are excluded from the client bundle.

Tailwind tokens and CSS variables are copied from the parent frontend. The primary
UI font is Noto Sans Devanagari, followed by Inter, loaded through Google Fonts.

Routes:

- `/`: Nepali hero and up to six latest selected stories.
- `/kathaharu`: catalogue with genre, sort and page query parameters. The native GET
  form works without JavaScript and resets to page one when filters change. Genre
  counts come from the editorial-flag-scoped directory.
- `/katha/:slug`: story header and first chapter in chapter order.
- `/katha/:slug/:chapterSlug`: one chapter in a continuous scroll, with a chapter
  list and previous/next links. Unknown stories and chapters return 404.

Empty selections, stories without chapters, and missing covers have Nepali fallbacks.
UI labels use Nepali; common English genre names have display labels in
`src/lib/nepali.ts`. Unmapped taxonomy names, story titles, author names and prose
remain as authored in the existing admin. Chapter prose carries its stored language
for accessibility, since editorial selection can include non-Nepali stories.

`npm run test:ssr` builds production output and verifies the actual request handler
against synthetic API fixtures: browser/bot HTML, filter forwarding, chapter order,
sanitization (including hydration data), empty states, 404s and upstream failures.
These fixtures are test-only and require no seeded database. A browser smoke check
also verified hydrated navigation, JavaScript-disabled forms and 390px mobile layouts.
Launch metadata and deployment remain in milestone 4.

See `../WORLDSTORIES_NEPALI_TODO.md` for verification and bundle measurements.

## Netlify deployment

Connect this project's Git repository and deploy using its build command.
`netlify.toml` sets `npm run build`, publish directory `build/client`, and Node 22.
If the connected repository root is `worldstories_np`, leave the base directory
empty. If it contains all sibling projects, set the base directory to
`worldstories_np`.

Set `VITE_API_URL` in Netlify before building, pointing to the public backend URL
including `/api`. Set `SSR_INTERNAL_API_KEY` in the function runtime environment
if the backend uses it. Redeploy after changes to build-time variables.

The Vite adapter generates `.netlify/v1/functions/react-router-server.mjs` with
`path: "/*"` and static-asset precedence. Netlify must build and deploy this
function along with `build/client`; uploading only the client folder will not
serve SSR pages. No `/index.html` SPA rewrite is needed.

Run `npm run test:netlify` to verify the generated function's route configuration
and rendered homepage, catalogue and chapter responses against test fixtures.
Sitemap, domain-specific metadata and remaining launch tasks are tracked separately.
