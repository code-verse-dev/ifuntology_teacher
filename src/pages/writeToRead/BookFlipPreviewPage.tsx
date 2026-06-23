import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicFlipBookViewer from "./PublicFlipBookViewer";
import { bookPageAspect, bookPdfSrc } from "./bookPreview";
import { useGetMyBooksQuery } from "@/redux/services/apiSlices/bookSlice";

type BookDoc = {
  _id: string;
  title: string;
  pdfUrl?: string;
  coverWidthPx?: number;
  coverHeightPx?: number;
};

export default function BookFlipPreviewPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useGetMyBooksQuery({ page: 1, limit: 50 });

  const book = useMemo(() => {
    const fromState = (location.state as { book?: BookDoc } | null)?.book;
    if (fromState && fromState._id === bookId) return fromState;
    const payload = data?.data;
    const list = Array.isArray(payload)
      ? payload
      : (payload?.docs ?? []);
    return (list as BookDoc[]).find((b) => b._id === bookId) ?? null;
  }, [bookId, data?.data, location.state]);

  const pdfUrl = book ? bookPdfSrc(book) : null;

  if (isLoading && !book) {
    return (
      <div className="public-flipbook-shell">
        <div className="public-flipbook__loading">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p>Loading preview…</p>
        </div>
      </div>
    );
  }

  if (!book || !pdfUrl) {
    return (
      <div className="public-flipbook-shell">
        <div className="public-flipbook__error">
          <BookOpen className="h-12 w-12 opacity-40" aria-hidden />
          <p className="text-lg font-semibold">Preview not available</p>
          <p className="max-w-sm text-sm opacity-70">
            Save your book in the builder first to generate a PDF.
          </p>
          <Button
            variant="outline"
            className="mt-2 rounded-full border-white/20 text-white"
            onClick={() => navigate("/write-to-read")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-flipbook-shell">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="fixed left-4 top-4 z-50 rounded-full border-white/15 bg-black/40 text-white backdrop-blur hover:bg-black/60"
        onClick={() => navigate("/write-to-read")}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back
      </Button>
      <PublicFlipBookViewer
        fileUrl={pdfUrl}
        title={book.title}
        pageAspect={bookPageAspect(book)}
      />
    </div>
  );
}
