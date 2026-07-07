import { useCallback, useEffect, useMemo } from "react";
import { BUILDER_DEFAULT_FETCH_INIT } from "@/book-builder/lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { TeacherBuilderWorkspace } from "./TeacherBuilderWorkspace";
import {
  BuilderHostProvider,
  type BuilderPageExportPayload,
} from "@/book-builder/context/BuilderHostContext";
import "@/book-builder/pages/book-builder.css";
import { BASE_URL, SOCKET_URL } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { setActiveBookBuilderId } from "./bookBuilderSession";
import TeacherBookBuilderShell from "./TeacherBookBuilderShell";
import {
  notifyMyBooksChanged,
  patchMyBooksCache,
  type MyBookListItem,
} from "./patchMyBooksCache";
import { bookSlice } from "@/redux/services/apiSlices/bookSlice";

async function readApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: unknown };
    if (typeof j.message === "string" && j.message.trim()) return j.message.trim();
  } catch {
    /* not JSON */
  }
  return text.trim() || `${res.status} ${res.statusText}`.trim();
}

function encodePagesHtmlForExport(pagesHtml: string[]): string[] {
  return pagesHtml.map((html) => {
    const bytes = new TextEncoder().encode(html);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
}

export default function BookBuilderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (bookId) setActiveBookBuilderId(bookId);
  }, [bookId]);

  if (!bookId) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Missing book id.</p>
        <Button
          variant="outline"
          onClick={() => navigate("/write-to-read", { state: { wtrActiveTab: "grade" } })}
        >
          Back to Grade Books
        </Button>
      </div>
    );
  }

  const pollPdfExportUntilSettled = async () => {
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2500));
      const statusRes = await fetch(
        `${BASE_URL}/book/${bookId}/pdf-export-status`,
        { credentials: "include" }
      );
      if (!statusRes.ok) continue;
      const statusJson = (await statusRes.json()) as {
        status?: boolean;
        data?: Partial<MyBookListItem> & {
          pdfExportStatus?: string;
          pdfExportError?: string | null;
        };
      };
      const row = statusJson.data;
      if (row?._id || bookId) {
        patchMyBooksCache(dispatch, {
          _id: String(row?._id ?? bookId),
          ...row,
        });
        notifyMyBooksChanged({
          _id: String(row?._id ?? bookId),
          ...row,
        });
      }
      const exportStatus = row?.pdfExportStatus;
      if (exportStatus === "READY") {
        toast.success("PDF is ready");
        dispatch(bookSlice.util.invalidateTags(["MyBooks"]));
        return;
      }
      if (exportStatus === "FAILED") {
        toast.error(
          statusJson.data?.pdfExportError?.trim() ||
            "PDF generation failed. Save again to retry."
        );
        return;
      }
    }
    toast.message("PDF is still generating. Check My Books in a moment.");
  };

  const exportPdfOnSave = useCallback(async (payload: BuilderPageExportPayload) => {
    const res = await fetch(`${BASE_URL}/book/${bookId}/export-pdf`, {
      method: "POST",
      credentials: "include",
      redirect: "manual",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pagesHtmlB64: encodePagesHtmlForExport(payload.pagesHtml),
        widthPx: payload.widthPx,
        heightPx: payload.heightPx,
        pageCount: payload.pageCount,
        wordCount: payload.wordCount,
        assetOrigin: SOCKET_URL,
        fontOrigin: SOCKET_URL,
        fontStylesheetUrls: payload.fontStylesheetUrls,
      }),
    });
    if (res.type === "opaqueredirect" || res.status === 403) {
      throw new Error(
        "PDF export was blocked by the hosting firewall. Try again or contact support.",
      );
    }
    if (!res.ok && res.status !== 202) {
      throw new Error(await readApiErrorMessage(res));
    }
    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: MyBookListItem;
    };
    if (json.status === false) {
      throw new Error(json.message || "Could not save book");
    }
    if (json.data?._id) {
      patchMyBooksCache(dispatch, json.data);
      notifyMyBooksChanged(json.data);
    } else if (bookId) {
      notifyMyBooksChanged({ _id: bookId });
    }
    dispatch(bookSlice.util.invalidateTags(["MyBooks"]));
    toast.success(
      json.message || "Draft saved. PDF is generating in the background."
    );
    void pollPdfExportUntilSettled();
  }, [bookId, dispatch]);

  const builderHostValue = useMemo(
    () => ({
      bookId,
      draftGetPath: `${BASE_URL}/book/${bookId}/builder-draft`,
      draftPutPath: `${BASE_URL}/book/${bookId}/builder-draft`,
      builderHref: `/write-to-read/builder/${bookId}`,
      characterHref: `/write-to-read/builder/${bookId}/character`,
      wurtleAssignmentsHref: `/write-to-read/builder/${bookId}/assignments/wurtle`,
      wtrAssignmentsHref: `/write-to-read/builder/${bookId}/assignments/wtr`,
      backHref: "/write-to-read",
      backState: { wtrActiveTab: "grade" as const },
      exportPdfOnSave,
      fetchInit: BUILDER_DEFAULT_FETCH_INIT,
      assetOrigin: SOCKET_URL,
    }),
    [bookId, exportPdfOnSave],
  );

  return (
    <TeacherBookBuilderShell>
      <BuilderHostProvider value={builderHostValue}>
        <TeacherBuilderWorkspace />
      </BuilderHostProvider>
    </TeacherBookBuilderShell>
  );
}
