import * as React from "react";
import { useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PublicFlipBookViewer from "./PublicFlipBookViewer";
import { BASE_URL } from "@/constants/api";
import { getBasename } from "@/utils/Functions";
import "./public-flipbook.css";

type PublicBookMeta = {
  title: string;
  pageCount?: number;
  wordCount?: number;
  authorName?: string | null;
  coverWidthPx?: number | null;
  coverHeightPx?: number | null;
};

function pageAspectFromMeta(book: PublicBookMeta | null): number | undefined {
  if (!book) return undefined;
  const w = Number(book.coverWidthPx ?? 0);
  const h = Number(book.coverHeightPx ?? 0);
  if (w > 0 && h > 0) return h / w;
  return undefined;
}

export default function PublicBookReaderPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [book, setBook] = React.useState<PublicBookMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!shareToken) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/public/book/${encodeURIComponent(shareToken)}`)
      .then(async (res) => {
        const json = (await res.json()) as {
          status?: boolean;
          message?: string;
          data?: PublicBookMeta;
        };
        if (cancelled) return;
        if (!res.ok || json.status === false || !json.data?.title) {
          throw new Error(json.message || "This book is not available");
        }
        setBook(json.data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBook(null);
        setError(e instanceof Error ? e.message : "Could not load book");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  React.useEffect(() => {
    document.title = book?.title
      ? `${book.title} — Read • iFuntology`
      : "Read book • iFuntology";
  }, [book?.title]);

  const pdfUrl = shareToken
    ? `${BASE_URL}/public/book/${encodeURIComponent(shareToken)}/pdf`
    : "";

  if (loading) {
    return (
      <div className="public-flipbook-shell">
        <div className="public-flipbook__loading">
          <div className="public-flipbook__spinner" aria-hidden />
          <p>Loading book…</p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="public-flipbook-shell">
        <div className="public-flipbook__error">
          <BookOpen className="h-12 w-12 opacity-40" aria-hidden />
          <p className="text-lg font-semibold">{error ?? "Book unavailable"}</p>
          <p className="max-w-sm text-sm opacity-70">
            The link may have expired or the author turned off sharing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-flipbook-shell">
      <PublicFlipBookViewer
        fileUrl={pdfUrl}
        title={book?.title}
        pageAspect={pageAspectFromMeta(book)}
      />
    </div>
  );
}

export function buildPublicBookReadUrl(shareToken: string): string {
  const basename = getBasename().replace(/\/+$/, "");
  const origin = window.location.origin.replace(/\/+$/, "");
  return `${origin}${basename}/read/${encodeURIComponent(shareToken)}`;
}
