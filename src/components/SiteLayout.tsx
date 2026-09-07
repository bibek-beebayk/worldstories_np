import { BookOpen } from "lucide-react";
import { Link, NavLink, Outlet, useNavigation } from "react-router";

export default function SiteLayout() {
  const navigation = useNavigation();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">मुख्य सामग्रीमा जानुहोस्</a>
      <header className="border-b bg-background">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />विश्वकथा
          </Link>
          <nav aria-label="मुख्य नेभिगेसन" className="flex gap-6 text-sm font-medium">
            <NavLink to="/" end className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>गृहपृष्ठ</NavLink>
            <NavLink to="/kathaharu" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>कथाहरू</NavLink>
          </nav>
        </div>
      </header>
      <div role="status" className="sr-only">{navigation.state !== "idle" ? "पृष्ठ खुल्दैछ…" : ""}</div>
      <main id="main-content" tabIndex={-1} className="flex-1"><Outlet /></main>
      <footer className="mt-16 border-t bg-secondary/50">
        <div className="container flex flex-wrap justify-between gap-4 py-8 text-sm text-muted-foreground">
          <p>संसारभरिका कथा, नेपालीमा।</p>
          <a href="https://worldstories.net" className="underline underline-offset-4 hover:text-primary">विश्वकथा मूल वेबसाइट</a>
        </div>
      </footer>
    </div>
  );
}
