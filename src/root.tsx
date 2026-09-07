import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from "react-router";
import type { ReactNode } from "react";
import "./index.css";
import { errorMeta } from "./lib/buildMeta";

export function meta() {
  return errorMeta();
}

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ne">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION} />
        )}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="container py-16">
      <h1 className="text-2xl font-bold">{notFound ? "यो पृष्ठ भेटिएन।" : "पृष्ठ खोल्न सकिएन।"}</h1>
      <a className="mt-6 inline-block text-primary underline" href="/">गृहपृष्ठमा फर्कनुहोस्</a>
    </main>
  );
}
