import { BookOpen } from "lucide-react";
import { useState } from "react";

export default function CoverImage({ src, title }: { src: string | null; title: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-secondary shadow-md">
      {src && src !== failedSrc ? (
        <img src={src} alt={title} width={300} height={400} loading="lazy" decoding="async"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-hero-gradient-start to-hero-gradient-end p-5 text-center text-primary-foreground">
          <BookOpen className="h-8 w-8 opacity-70" aria-hidden="true" />
          <span className="line-clamp-4 text-lg font-semibold">{title}</span>
        </div>
      )}
    </div>
  );
}
