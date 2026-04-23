import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Info, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAssignGradeMutation,
  useGetAvailableForReviewQuery,
  type AssignBookGradeBody,
} from "@/redux/services/apiSlices/bookSlice";

type ReviewBookDoc = {
  _id: string;
  title: string;
  status?: string;
  pageCount?: number;
  wordCount?: number;
  submittedAt?: string;
  pdfUrl?: string;
  feedback?: string;
  grade?: AssignBookGradeBody["grade"];
  owner?:
    | string
    | { firstName?: string; lastName?: string; email?: string };
};

function authorLabel(book: ReviewBookDoc): string {
  const o = book.owner;
  if (o && typeof o === "object") {
    const name = [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
    return name || o.email || "Student";
  }
  return "Student";
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

/** Card + modal primary action when opening the same PATCH assign-grade flow. */
function primaryGradeActionLabel(book: ReviewBookDoc): string {
  return isBookGraded(book) ? "Update Grade" : "Grade book";
}

export function GradeBooksTab() {
  const { data: booksRes, isLoading, isError, refetch } =
    useGetAvailableForReviewQuery({ page: 1, limit: 20 });
  const [assignGrade, { isLoading: isSubmitting }] = useAssignGradeMutation();

  const books: ReviewBookDoc[] =
    booksRes?.data?.docs ?? booksRes?.docs ?? [];

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<ReviewBookDoc | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<
    AssignBookGradeBody["grade"] | null
  >(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");

  const openGradeModal = (book: ReviewBookDoc) => {
    setSelectedBook(book);
    setSelectedGrade(book.grade ?? null);
    setFeedbackDraft(book.feedback ?? "");
    setGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setGradeModalOpen(false);
    setSelectedBook(null);
    setSelectedGrade(null);
    setFeedbackDraft("");
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
        body: {
          grade: selectedGrade,
          feedback: feedbackDraft.trim() || undefined,
        },
      }).unwrap();
      toast.success(
        isBookGraded(selectedBook) ? "Grade updated." : "Grade submitted."
      );
      closeGradeModal();
    } catch (e: any) {
      const msg =
        e?.data?.message ??
        e?.data?.response?.message ??
        "Could not submit grade.";
      toast.error(typeof msg === "string" ? msg : "Could not submit grade.");
    }
  };

  const readPdf = (book: ReviewBookDoc) => {
    if (!book.pdfUrl) {
      toast.message("No PDF is available for this book yet.");
      return;
    }
    window.open(book.pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <TabsContent
      value="grade"
      className="space-y-6 mt-0 outline-none text-left"
    >
      {isLoading && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading books…
        </p>
      )}

      {isError && (
        <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm">
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
        <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm">
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
            className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-lime-50 dark:bg-lime-500/10 flex items-center justify-center text-lime-500 shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {book.title}{" "}
                    <span className="text-slate-400 font-normal">
                      {" "}
                      — by {authorLabel(book)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Submitted: {formatSubmitted(book.submittedAt)}
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  "rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wide border-none",
                  book.status === "COMPLETED"
                    ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                )}
              >
                {book.status === "PENDING_REVIEW"
                  ? "Pending review"
                  : book.status ?? "—"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-full px-4 h-8 font-bold text-xs">
                {book.pageCount ?? 0} pages
              </Badge>
              <Badge className="bg-orange-600 hover:bg-orange-700 text-white border-none rounded-full px-4 h-8 font-bold text-xs">
                {book.wordCount ?? 0} words
              </Badge>
              {book.status === "COMPLETED" && book.grade ? (
                <Badge className="bg-lime-600 hover:bg-lime-700 text-white border-none rounded-full px-4 h-8 font-bold text-xs">
                  Grade: {gradeDisplayLabel(book.grade)}
                </Badge>
              ) : null}
            </div>
            {book.feedback ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 relative">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-orange-500 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                      Feedback on file:
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {book.feedback}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-200 dark:border-slate-800 h-11 px-8 font-bold text-sm"
                onClick={() => readPdf(book)}
              >
                Read book
              </Button>
              <Button
                type="button"
                className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-8 border-none shadow-none"
                onClick={() => openGradeModal(book)}
              >
                {primaryGradeActionLabel(book)}
              </Button>
            </div>
          </Card>
        ))}

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
              By {selectedBook ? authorLabel(selectedBook) : "—"}
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

            <div className="space-y-3 text-left">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Feedback & comments
              </Label>
              <Textarea
                value={feedbackDraft}
                onChange={(e) => setFeedbackDraft(e.target.value)}
                placeholder="Optional feedback for the student…"
                className="min-h-[140px] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-none p-6 resize-none text-sm font-medium"
              />
            </div>

            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl text-orange-500 shrink-0 shadow-sm">
                <Info className="h-5 w-5" />
              </div>
              <p className="text-[11px] text-orange-600 font-bold leading-relaxed pt-1">
                Your feedback helps the student improve their writing and
                supports their authorship journey.
              </p>
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
  );
}
