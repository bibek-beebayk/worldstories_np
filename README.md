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
npm start
```

The production Node server defaults to port 3000 (`PORT` overrides it). React Router
streams server-rendered HTML and hydrates it in the browser, using the parent
frontend's bot-aware server entry. Netlify setup belongs to milestone 4.

`src/api/client.ts`, `story.ts` and `types.ts` follow the parent API module layout.
The four read endpoints are story list, story detail, text chapter detail, and
genres. Each includes the editorial selection flag; chapter requests also include
the backend-required `type=text`. Detail metadata intentionally has no chapter
body. Milestone 3 must sanitize chapter content with the included `sanitize-html`
before rendering it as HTML.

Tailwind tokens and CSS variables are copied from the parent frontend. The primary
UI font is Noto Sans Devanagari, followed by Inter, loaded through Google Fonts.
The current home route is only a Nepali scaffold placeholder. Catalogue, story
cards, reader, launch metadata, and deployment remain in later milestones.

See `../WORLDSTORIES_NEPALI_TODO.md` for verification and bundle measurements.
