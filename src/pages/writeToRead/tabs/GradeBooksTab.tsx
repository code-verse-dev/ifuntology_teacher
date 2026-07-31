import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, ChevronRight, MoreVertical, RotateCcw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAssignGradeMutation,
  useGetAvailableForReviewQuery,
  useRejectReviewMutation,
  type AssignBookGradeBody,
} from "@/redux/services/apiSlices/bookSlice";
import { BASE_URL, SOCKET_URL } from "@/constants/api";
import PublicFlipBookViewer from "../PublicFlipBookViewer";
import { bookPageAspect } from "../bookPreview";
import { TeacherMyBooksSection } from "./TeacherMyBooksSection";
import "../public-flipbook.css";

type ReviewBookDoc = {
  _id: string;
  title: string;
  status?: string;
  pageCount?: number;
  wordCount?: number;
  submittedAt?: string;
  pdfUrl?: string;
  pdfStorageKey?: string;
  coverWidthPx?: number;
  coverHeightPx?: number;
  grade?: AssignBookGradeBody["grade"];
  owner?:
    | string
    | {
        firstName?: string;
        lastName?: string;
        email?: string;
        username?: string;
      };
  wtrBatch?: {
    _id?: string;
    title?: string;
    teacherName?: string;
    organizationName?: string;
  } | null;
  lmsCourseTypes?: string[];
};

function authorLabel(book: ReviewBookDoc): string {
  const o = book.owner;
  if (o && typeof o === "object") {
    const name = [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
    return name || o.username || o.email || "Student";
  }
  return "Student";
}

function courseEnrollmentLabel(book: ReviewBookDoc): string {
  const batchTitle = book.wtrBatch?.title?.trim();
  const lmsCourses = (book.lmsCourseTypes ?? []).filter(Boolean);
  const parts: string[] = [];
  if (batchTitle) parts.push(batchTitle);
  if (lmsCourses.length) parts.push(lmsCourses.join(", "));
  return parts.join(" · ") || "—";
}

function formatSubmitted(submittedAt?: string): string {
  if (!submittedAt) return "—";
  try {
    const d =
      typeof submittedAt === "string"
        ? parseISO(submittedAt)
        : new Date(submittedAt);
    return format(d, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

const GRADE_OPTIONS: {
  value: AssignBookGradeBody["grade"];
  label: string;
  count: number;
  color: "orange" | "blue" | "green";
}[] = [
  { value: "FAIR", label: "Fair", count: 1, color: "orange" },
  { value: "GOOD", label: "Good", count: 2, color: "blue" },
  { value: "EXCELLENT", label: "Excellent", count: 3, color: "green" },
];

function gradeDisplayLabel(grade: AssignBookGradeBody["grade"]): string {
  return GRADE_OPTIONS.find((g) => g.value === grade)?.label ?? grade;
}

function isBookGraded(book: ReviewBookDoc): boolean {
  return book.status === "COMPLETED";
}

function resolveBookPdfUrl(book: ReviewBookDoc): string | null {
  const path =
    book.pdfUrl?.trim() ||
    (book.pdfStorageKey?.trim()
      ? `/Uploads/${book.pdfStorageKey.trim().replace(/^Uploads\//i, "")}`
      : "");
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const origin = SOCKET_URL.replace(/\/+$/, "");
  if (origin) {
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path.startsWith("/") ? path : `/${path}`;
}

async function readApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: unknown };
    if (typeof j.message === "string" && j.message.trim()) return j.message.trim();
  } catch {
    /* not JSON */
  }
  return text.trim() || `${res.status} ${res.statusText}`;
}

function primaryGradeActionLabel(book: ReviewBookDoc): string {
  return isBookGraded(book) ? "Update Grade" : "Grade book";
}

export function GradeBooksTab({
  createBookRequestId = 0,
}: {
  createBookRequestId?: number;
}) {
  const { data: booksRes, isLoading, isError, refetch } =
    useGetAvailableForReviewQuery({ page: 1, limit: 20 });
  const [assignGrade, { isLoading: isSubmitting }] = useAssignGradeMutation();
  const [rejectReview, { isLoading: isRejecting }] = useRejectReviewMutation();

  const books: ReviewBookDoc[] =
    booksRes?.data?.docs ?? booksRes?.docs ?? [];

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<ReviewBookDoc | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<
    AssignBookGradeBody["grade"] | null
  >(null);
  const [openingPdfId, setOpeningPdfId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [flipbookPreview, setFlipbookPreview] = useState<{
    title: string;
    pdfUrl: string;
    coverWidthPx?: number;
    coverHeightPx?: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (flipbookPreview?.pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(flipbookPreview.pdfUrl);
      }
    };
  }, [flipbookPreview?.pdfUrl]);

  const closeFlipbookPreview = () => {
    if (flipbookPreview?.pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(flipbookPreview.pdfUrl);
    }
    setFlipbookPreview(null);
  };

  const openGradeModal = (book: ReviewBookDoc) => {
    setSelectedBook(book);
    setSelectedGrade(book.grade ?? null);
    setGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setGradeModalOpen(false);
    setSelectedBook(null);
    setSelectedGrade(null);
  };

  const openRejectModal = (book: ReviewBookDoc) => {
    setSelectedBook(book);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    if (!gradeModalOpen) setSelectedBook(null);
  };

  const handleRejectReview = async () => {
    if (!selectedBook?._id) return;
    try {
      await rejectReview({ bookId: selectedBook._id }).unwrap();
      toast.success("Book sent back to the student for revisions.");
      closeRejectModal();
      void refetch();
    } catch (e: any) {
      const msg =
        e?.data?.message ??
        e?.data?.response?.message ??
        "Could not return book for revisions.";
      toast.error(typeof msg === "string" ? msg : "Could not return book for revisions.");
    }
  };

  const handleSubmitGrade = async () => {
    if (!selectedBook?._id) return;
    if (!selectedGrade) {
      toast.error("Please select a grade.");
      return;
    }
    try {
      await assignGrade({
        bookId: selectedBook._id,
        body: { grade: selectedGrade },
      }).unwrap();
      toast.success(
        isBookGraded(selectedBook) ? "Grade updated." : "Grade submitted."
      );
      closeGradeModal();
      void refetch();
    } catch (e: any) {
      const msg =
        e?.data?.message ??
        e?.data?.response?.message ??
        "Could not submit grade.";
      toast.error(typeof msg === "string" ? msg : "Could not submit grade.");
    }
  };

  const readPdf = async (book: ReviewBookDoc) => {
    if (!book.pdfUrl?.trim() && !book.pdfStorageKey?.trim()) {
      toast.message("No PDF is available for this book yet.");
      return;
    }
    setOpeningPdfId(book._id);
    try {
      const res = await fetch(`${BASE_URL}/book/${book._id}/review-pdf`, {
        credentials: "include",
      });
      let pdfUrl: string | null = null;
      if (res.ok) {
        const blob = await res.blob();
        pdfUrl = URL.createObjectURL(blob);
      } else {
        pdfUrl = resolveBookPdfUrl(book);
        if (!pdfUrl) {
          toast.error(await readApiErrorMessage(res));
          return;
        }
      }
      setFlipbookPreview({
        title: book.title,
        pdfUrl,
        coverWidthPx: book.coverWidthPx,
        coverHeightPx: book.coverHeightPx,
      });
    } catch {
      const fallback = resolveBookPdfUrl(book);
      if (fallback) {
        setFlipbookPreview({
          title: book.title,
          pdfUrl: fallback,
          coverWidthPx: book.coverWidthPx,
          coverHeightPx: book.coverHeightPx,
        });
      } else {
        toast.error("Could not open the book PDF.");
      }
    } finally {
      setOpeningPdfId(null);
    }
  };

  return (
    <>
    <TabsContent
      value="grade"
      className="mt-0 space-y-8 outline-none text-left"
    >
      <TeacherMyBooksSection createBookRequestId={createBookRequestId} />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Student Books to Grade
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Books submitted by your students for review.
            </p>
          </div>
          {books.length > 0 ? (
            <button
              type="button"
              className="inline-flex items-center text-sm font-bold text-lime-600 hover:text-lime-500 dark:text-lime-400"
              onClick={() => {
                document
                  .getElementById("wtr-student-books-list")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div id="wtr-student-books-list" className="space-y-3">
          {isLoading && (
            <p className="py-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading books…
            </p>
          )}

          {isError && (
            <Card className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Could not load books pending review.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </Card>
          )}

          {!isLoading && !isError && books.length === 0 && (
            <Card className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No books are pending review right now.
              </p>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            books.map((book) => (
              <Card
                key={book._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-500">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                          {book.title}
                        </h3>
                        <Badge
                          className={cn(
                            "rounded-full border-none px-3 py-1 text-[10px] font-bold uppercase",
                            book.status === "COMPLETED"
                              ? "bg-green-500/15 text-green-500"
                              : book.status === "DRAFT"
                                ? "bg-orange-500/15 text-orange-500"
                                : "bg-blue-500/15 text-blue-500"
                          )}
                        >
                          {book.status === "PENDING_REVIEW"
                            ? "Pending review"
                            : book.status === "DRAFT"
                              ? "Returned for revisions"
                              : book.status === "COMPLETED"
                                ? "Graded"
                                : book.status ?? "—"}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Student: {authorLabel(book)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Course / batch: {courseEnrollmentLabel(book)}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Submitted on {formatSubmitted(book.submittedAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {book.pageCount ?? 0} pages
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {book.wordCount ?? 0} words
                        </span>
                        {book.status === "COMPLETED" && book.grade ? (
                          <span className="inline-flex items-center rounded-full bg-lime-500/15 px-3 py-1 text-xs font-bold text-lime-600">
                            Grade: {gradeDisplayLabel(book.grade)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full border-slate-200 px-5 text-sm font-bold dark:border-slate-700"
                      onClick={() => void readPdf(book)}
                      disabled={openingPdfId === book._id}
                    >
                      {openingPdfId === book._id ? "Opening…" : "Read Book"}
                    </Button>
                    {book.status === "PENDING_REVIEW" ? (
                      <>
                        <Button
                          type="button"
                          className="h-10 rounded-full border-none bg-lime-600 px-5 text-sm font-bold text-white hover:bg-lime-700"
                          onClick={() => openGradeModal(book)}
                        >
                          Grade Book
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 rounded-full border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                          onClick={() => openRejectModal(book)}
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Revisions
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        className="h-10 rounded-full border-none bg-lime-600 px-5 text-sm font-bold text-white hover:bg-lime-700"
                        onClick={() => openGradeModal(book)}
                      >
                        {primaryGradeActionLabel(book)}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-slate-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      <Dialog open={rejectModalOpen} onOpenChange={(open) => !open && closeRejectModal()}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 border-none shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Send back for revisions?
            </DialogTitle>
            <p className="text-xs font-medium text-slate-400">
              {selectedBook
                ? `${selectedBook.title} — ${authorLabel(selectedBook)}`
                : "—"}
            </p>
          </DialogHeader>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
            The book will return to draft so the student can edit and submit again.
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full h-12 font-bold"
              onClick={closeRejectModal}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 border-none"
              onClick={() => void handleRejectReview()}
              disabled={isRejecting}
            >
              {isRejecting ? "Sending back…" : "Send back"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gradeModalOpen} onOpenChange={(open) => !open && closeGradeModal()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-12 border-none shadow-2xl custom-scrollbar">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {selectedBook
                ? isBookGraded(selectedBook)
                  ? `Update Grade: ${selectedBook.title}`
                  : `Grade book: ${selectedBook.title}`
                : "Grade book"}
            </DialogTitle>
            <p className="text-xs font-medium text-slate-400">
              Student: {selectedBook ? authorLabel(selectedBook) : "—"}
              {selectedBook ? (
                <>
                  {" · "}
                  Course / batch: {courseEnrollmentLabel(selectedBook)}
                </>
              ) : null}
            </p>
          </DialogHeader>

          <div className="space-y-8 mt-8">
            <div className="space-y-4 text-left">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Grade <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-4">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setSelectedGrade(g.value)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all group",
                      selectedGrade === g.value
                        ? "border-lime-500 ring-2 ring-lime-500/30"
                        : "border-transparent",
                      g.color === "orange"
                        ? "bg-orange-50/50 hover:border-orange-500 dark:bg-orange-500/10"
                        : g.color === "blue"
                          ? "bg-blue-50/50 hover:border-blue-500 dark:bg-blue-500/10"
                          : "bg-green-50/50 hover:border-green-500 dark:bg-green-500/10"
                    )}
                  >
                    <div
                      className={cn(
                        "flex gap-1",
                        g.color === "orange"
                          ? "text-orange-500"
                          : g.color === "blue"
                            ? "text-blue-500"
                            : "text-green-500"
                      )}
                    >
                      {Array.from({ length: g.count }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "text-base font-bold",
                        g.color === "orange"
                          ? "text-orange-600"
                          : g.color === "blue"
                            ? "text-blue-600"
                            : "text-green-600"
                      )}
                    >
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-14 font-extrabold text-slate-600 dark:text-slate-400"
                onClick={closeGradeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-full bg-lime-500 hover:bg-lime-600 text-white font-extrabold h-14 border-none shadow-lg shadow-lime-500/20"
                onClick={handleSubmitGrade}
                disabled={isSubmitting}
              >
                {selectedBook && isBookGraded(selectedBook)
                  ? "Update Grade"
                  : "Submit grade"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>

    {flipbookPreview ? (
      <div className="public-flipbook-shell">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="fixed left-4 top-4 z-50 rounded-full border-white/15 bg-black/40 text-white backdrop-blur hover:bg-black/60"
          onClick={closeFlipbookPreview}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        <PublicFlipBookViewer
          fileUrl={flipbookPreview.pdfUrl}
          title={flipbookPreview.title}
          pageAspect={bookPageAspect(flipbookPreview)}
        />
      </div>
    ) : null}
    </>
  );
}
