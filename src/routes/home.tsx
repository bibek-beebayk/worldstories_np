import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-6 py-16 text-center">
      <BookOpen className="h-12 w-12 text-primary" aria-hidden="true" />
      <h1 className="text-4xl font-bold">विश्वकथा</h1>
      <p className="text-lg text-muted-foreground">संसारभरिका कथा, नेपालीमा।</p>
      <p className="text-muted-foreground">कथाहरू चाँडै आउँदैछन्।</p>
    </main>
  );
}
