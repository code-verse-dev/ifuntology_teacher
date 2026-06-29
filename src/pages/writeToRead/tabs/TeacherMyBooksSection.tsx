import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useCreateBookMutation,
  useDeleteBookByIdMutation,
  useGetMyBooksQuery,
} from "@/redux/services/apiSlices/bookSlice";
import { SOCKET_URL } from "@/constants/api";

type TeacherBookDoc = {
  _id: string;
  title: string;
  status?: string;
  pageCount?: number;
  wordCount?: number;
  pdfUrl?: string;
  pdfStorageKey?: string;
  pdfExportStatus?: string;
  updatedAt?: string;
};

function statusLabel(status?: string) {
  if (status === "DRAFT") return "Draft";
  if (status === "PENDING_REVIEW") return "Pending review";
  if (status === "COMPLETED") return "Completed";
  return status ?? "—";
}

function pdfExportHint(book: TeacherBookDoc): string | null {
  if (book.pdfExportStatus === "PROCESSING") return "Generating PDF…";
  if (book.pdfExportStatus === "FAILED") return "PDF failed — save again in builder";
  return null;
}

export function TeacherMyBooksSection() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetMyBooksQuery({ page: 1, limit: 50 });
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookByIdMutation();

  const books: TeacherBookDoc[] = data?.data?.docs ?? data?.docs ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [bookToDelete, setBookToDelete] = useState<TeacherBookDoc | null>(null);

  useEffect(() => {
    const onSaved = () => void refetch();
    window.addEventListener("wtr-book-saved", onSaved);
    return () => window.removeEventListener("wtr-book-saved", onSaved);
  }, [refetch]);

  const handleCreate = async () => {
    const trimmed = createTitle.trim();
    if (!trimmed) {
      toast.error("Title is required");
      return;
    }
    const formData = new FormData();
    formData.append("title", trimmed);
    try {
      const res = await createBook(formData).unwrap();
      if (res?.status) {
        const bookId = res?.data?._id;
        toast.success(res?.message || "Opening book builder…");
        setCreateOpen(false);
        setCreateTitle("");
        void refetch();
        if (bookId) {
          navigate(`/write-to-read/builder/${bookId}`);
        }
      } else {
        toast.error(res?.message || "Could not create book");
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; error?: string };
      const msg = err?.data?.message || err?.error || "Could not create book";
      toast.error(typeof msg === "string" ? msg : "Could not create book");
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    try {
      const res = await deleteBook({ id: bookToDelete._id }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Book deleted");
        setBookToDelete(null);
        void refetch();
      } else {
        toast.error(res?.message || "Could not delete book");
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; error?: string };
      const msg = err?.data?.message || err?.error || "Could not delete book";
      toast.error(typeof msg === "string" ? msg : "Could not delete book");
    }
  };

  const openPdf = (book: TeacherBookDoc) => {
    const path =
      book.pdfUrl?.trim() ||
      (book.pdfStorageKey?.trim()
        ? `/Uploads/${book.pdfStorageKey.trim().replace(/^Uploads\//i, "")}`
        : "");
    if (!path) {
      toast.message("Save in the builder to generate a PDF first.");
      return;
    }
    const origin = SOCKET_URL.replace(/\/+$/, "");
    const url =
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${origin}${path.startsWith("/") ? path : `/${path}`}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Books
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Create and edit your own books with the same builder students use.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 border-none shadow-none gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create book
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your books…
        </div>
      ) : books.length === 0 ? (
        <p className="text-sm font-medium text-slate-500">
          You haven&apos;t created any books yet. Click &quot;Create book&quot; to start.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => {
            const hint = pdfExportHint(book);
            return (
              <Card
                key={book._id}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-50 dark:bg-lime-500/10 flex items-center justify-center text-lime-600 shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                      {book.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-none",
                          book.status === "DRAFT"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-green-100 text-green-600"
                        )}
                      >
                        {statusLabel(book.status)}
                      </Badge>
                      <Badge className="rounded-lg px-2 py-0.5 text-[10px] font-bold border-none bg-orange-100 text-orange-600">
                        {book.pageCount ?? 0} pages
                      </Badge>
                    </div>
                    {hint ? (
                      <p className="text-xs text-amber-600 mt-2 font-medium">{hint}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold gap-1.5"
                    onClick={() => navigate(`/write-to-read/builder/${book._id}`)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Open builder
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full font-bold"
                    onClick={() => openPdf(book)}
                  >
                    View PDF
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full font-bold text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    onClick={() => setBookToDelete(book)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] bg-white dark:bg-slate-900 p-8 border-none shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Create a book
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Book title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. My Science Adventure"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="h-12 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
            />
          </div>
          <DialogFooter className="gap-2 mt-6 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full font-bold"
              onClick={() => setCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold border-none"
              onClick={() => void handleCreate()}
              disabled={isCreating}
            >
              {isCreating ? "Creating…" : "Create & open builder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(bookToDelete)} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold">Delete book?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {bookToDelete?.title} will be permanently deleted.
          </p>
          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="rounded-full font-bold"
              onClick={() => setBookToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold border-none"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
