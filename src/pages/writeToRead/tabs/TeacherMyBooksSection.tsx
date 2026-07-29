import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  BookOpen,
  Loader2,
  MoreVertical,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useCreateBookMutation,
  useDeleteBookByIdMutation,
  useGetMyBooksQuery,
} from "@/redux/services/apiSlices/bookSlice";
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
  createdAt?: string;
};

const BOOK_ICON_COLORS = [
  "bg-lime-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-teal-500",
];

function statusLabel(status?: string) {
  if (status === "DRAFT") return "Draft";
  if (status === "PENDING_REVIEW") return "Pending review";
  if (status === "COMPLETED") return "Published";
  return status ?? "—";
}

function statusClass(status?: string) {
  if (status === "COMPLETED") {
    return "bg-green-500/15 text-green-500 dark:bg-green-500/10 dark:text-green-400";
  }
  if (status === "PENDING_REVIEW") {
    return "bg-orange-500/15 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400";
  }
  return "bg-blue-500/15 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400";
}

function formatBookDate(value?: string) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

function pdfExportHint(book: TeacherBookDoc): string | null {
  if (book.pdfExportStatus === "PROCESSING") return "Generating PDF…";
  if (book.pdfExportStatus === "FAILED") return "PDF failed — save again in builder";
  return null;
}

export function TeacherMyBooksSection({
  createBookRequestId = 0,
}: {
  createBookRequestId?: number;
}) {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetMyBooksQuery({ page: 1, limit: 50 });
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookByIdMutation();

  const books: TeacherBookDoc[] = data?.data?.docs ?? data?.docs ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [bookToDelete, setBookToDelete] = useState<TeacherBookDoc | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const onSaved = () => void refetch();
    window.addEventListener("wtr-book-saved", onSaved);
    return () => window.removeEventListener("wtr-book-saved", onSaved);
  }, [refetch]);

  useEffect(() => {
    if (createBookRequestId > 0) {
      setCreateOpen(true);
    }
  }, [createBookRequestId]);

  const stats = useMemo(() => {
    const total = books.length;
    const published = books.filter((b) => b.status === "COMPLETED").length;
    const inReview = books.filter((b) => b.status === "PENDING_REVIEW").length;
    return { total, published, inReview };
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch = !query || book.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || (book.status ?? "DRAFT") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, search, statusFilter]);

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

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-left">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Grade Books</h2>
        <p className="text-sm font-medium text-slate-500">
          Create, manage, and grade student writing projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Books",
            value: stats.total,
            sub: "Books created",
            iconBg: "bg-lime-500/10 text-lime-500",
          },
          {
            label: "Published",
            value: stats.published,
            sub: "Live books",
            iconBg: "bg-blue-500/10 text-blue-500",
          },
          {
            label: "In Review",
            value: stats.inReview,
            sub: "Awaiting action",
            iconBg: "bg-violet-500/10 text-violet-500",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  item.iconBg
                )}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Books</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books…"
                className="h-10 rounded-full border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[140px] rounded-full border-slate-200 bg-white font-semibold dark:border-slate-700 dark:bg-slate-900">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_REVIEW">In Review</SelectItem>
                <SelectItem value="COMPLETED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your books…
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-sm font-medium text-slate-500">
              {books.length === 0
                ? 'You haven\'t created any books yet. Use "Create Book" under View Invoice to start.'
                : "No books match your search or filter."}
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Book Name
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Created On
                  </th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Pages
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Last Updated
                  </th>
                  <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBooks.map((book, index) => {
                  const hint = pdfExportHint(book);
                  return (
                    <tr
                      key={book._id}
                      className="bg-white transition-colors hover:bg-slate-50/70 dark:bg-slate-900/30 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
                              BOOK_ICON_COLORS[index % BOOK_ICON_COLORS.length]
                            )}
                          >
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {book.title}
                            </p>
                            <Badge
                              className={cn(
                                "mt-1 rounded-full border-none px-2 py-0.5 text-[9px] font-bold uppercase",
                                statusClass(book.status)
                              )}
                            >
                              {statusLabel(book.status)}
                            </Badge>
                            {hint ? (
                              <p className="mt-1 text-xs font-medium text-amber-600">{hint}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-500">
                        {formatBookDate(book.createdAt ?? book.updatedAt)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                        {book.pageCount ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={cn(
                            "rounded-full border-none px-3 py-1 text-[10px] font-bold uppercase",
                            statusClass(book.status)
                          )}
                        >
                          {statusLabel(book.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-500">
                        {formatBookDate(book.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-lime-500/40 font-bold text-lime-600 hover:bg-lime-500/10 dark:text-lime-400"
                            onClick={() => navigate(`/write-to-read/builder/${book._id}`)}
                          >
                            Open Builder
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            onClick={() => setBookToDelete(book)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2rem] border-none bg-white p-8 shadow-2xl dark:bg-slate-900 sm:max-w-[480px]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Create a book
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
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
          <DialogFooter className="mt-6 gap-2 sm:justify-end">
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
              className="rounded-full border-none bg-lime-600 font-bold text-white hover:bg-lime-700"
              onClick={() => void handleCreate()}
              disabled={isCreating}
            >
              {isCreating ? "Creating…" : "Create & open builder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(bookToDelete)} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <DialogContent className="rounded-[2rem] border-none p-8 shadow-2xl sm:max-w-[420px]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold">Delete book?</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {bookToDelete?.title} will be permanently deleted.
          </p>
          <DialogFooter className="mt-6 gap-2">
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
              className="rounded-full border-none bg-red-600 font-bold text-white hover:bg-red-700"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
