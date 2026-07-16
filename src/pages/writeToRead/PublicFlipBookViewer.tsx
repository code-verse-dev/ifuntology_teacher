import * as React from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { isIOS } from "@/utils/isIOS";
import "./public-flipbook.css";
import { playPageFlipSound, primePageFlipSound } from "./pageFlipSound";

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

type Props = {
  fileUrl: string;
  title?: string;
  /** Page height ÷ width from builder export (preferred). */
  pageAspect?: number;
};

/** High-res multiplier for crisp text on retina displays. Capped lower on iOS. */
function resolveRenderScale(): number {
  if (typeof window === "undefined") return 2.5;
  if (isIOS()) {
    return Math.min(1.75, Math.max(1.25, window.devicePixelRatio));
  }
  return Math.min(3.5, Math.max(2, window.devicePixelRatio * 1.75));
}

function fitPageDimensions(
  viewportW: number,
  viewportH: number,
  pageAspect: number,
  isMobile: boolean,
): { width: number; height: number } {
  const horizontalPad = isMobile ? 12 : 40;
  const verticalPad = isMobile ? 28 : 40;
  const availW = Math.max(160, viewportW - horizontalPad);
  const availH = Math.max(200, viewportH - verticalPad);
  const aspect = pageAspect > 0 ? pageAspect : 297 / 210;

  let pageW = Math.floor(isMobile ? availW : availW / 2);
  let pageH = Math.round(pageW * aspect);

  if (pageH > availH) {
    pageH = Math.floor(availH);
    pageW = Math.floor(pageH / aspect);
  }

  return {
    width: Math.max(120, pageW),
    height: Math.max(160, pageH),
  };
}

async function rasterizePdfPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  bitmapHeight: number,
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = bitmapHeight / base.height;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not available");
  }

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  if (isIOS()) {
    return canvas.toDataURL("image/jpeg", 0.88);
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.94);
  });
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return canvas.toDataURL("image/png");
}

const PublicFlipPage = React.forwardRef<
  HTMLDivElement,
  {
    imageUrl: string;
    slotWidth: number;
    slotHeight: number;
  }
>(({ imageUrl, slotWidth, slotHeight }, ref) => (
  <div
    ref={ref}
    className="public-flipbook__page"
    style={{
      width: slotWidth,
      height: slotHeight,
    }}
  >
    <img
      src={imageUrl}
      alt=""
      className="public-flipbook__page-img"
      draggable={false}
    />
  </div>
));
PublicFlipPage.displayName = "PublicFlipPage";

type SimpleSpreadViewerProps = {
  pageImages: string[];
  pageWidth: number;
  pageHeight: number;
  usePortrait: boolean;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
};

/** Lightweight page viewer for iOS — avoids react-pageflip stack overflows in WebKit. */
function SimpleSpreadViewer({
  pageImages,
  pageWidth,
  pageHeight,
  usePortrait,
  currentPage,
  numPages,
  onPageChange,
}: SimpleSpreadViewerProps) {
  const touchStartXRef = React.useRef<number | null>(null);
  const layoutWidth = usePortrait ? pageWidth : pageWidth * 2;

  const isFirst = currentPage <= 0;
  const isLast = usePortrait
    ? currentPage >= numPages - 1
    : currentPage >= numPages - 2;

  const goPrev = React.useCallback(() => {
    if (isFirst) return;
    playPageFlipSound();
    onPageChange(Math.max(0, currentPage - (usePortrait ? 1 : 2)));
  }, [currentPage, isFirst, onPageChange, usePortrait]);

  const goNext = React.useCallback(() => {
    if (isLast) return;
    playPageFlipSound();
    const step = usePortrait ? 1 : 2;
    onPageChange(Math.min(numPages - 1, currentPage + step));
  }, [currentPage, isLast, numPages, onPageChange, usePortrait]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (Math.abs(dx) < 36) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const leftUrl = pageImages[currentPage] ?? "";
  const rightUrl = usePortrait ? null : (pageImages[currentPage + 1] ?? null);

  return (
    <div
      className="public-flipbook__simple-spread"
      style={{ width: layoutWidth, height: pageHeight }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {!isFirst ? (
        <button
          type="button"
          className="public-flipbook__simple-nav public-flipbook__simple-nav--prev"
          onClick={goPrev}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      ) : null}
      <div
        className="public-flipbook__simple-pages"
        style={{ width: layoutWidth, height: pageHeight }}
      >
        {leftUrl ? (
          <div
            className="public-flipbook__page"
            style={{ width: pageWidth, height: pageHeight }}
          >
            <img
              src={leftUrl}
              alt=""
              className="public-flipbook__page-img"
              draggable={false}
            />
          </div>
        ) : null}
        {rightUrl ? (
          <div
            className="public-flipbook__page"
            style={{ width: pageWidth, height: pageHeight }}
          >
            <img
              src={rightUrl}
              alt=""
              className="public-flipbook__page-img"
              draggable={false}
            />
          </div>
        ) : null}
      </div>
      {!isLast ? (
        <button
          type="button"
          className="public-flipbook__simple-nav public-flipbook__simple-nav--next"
          onClick={goNext}
          aria-label="Next page"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      ) : null}
    </div>
  );
}

export default function PublicFlipBookViewer({
  fileUrl,
  title,
  pageAspect: pageAspectProp,
}: Props) {
  const [numPages, setNumPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [loadError, setLoadError] = React.useState(false);
  const [pageSize, setPageSize] = React.useState({ width: 0, height: 0 });
  const [pdfAspect, setPdfAspect] = React.useState<number | null>(null);
  const [pageImages, setPageImages] = React.useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = React.useState(true);
  const [rasterizing, setRasterizing] = React.useState(false);
  const [usePortrait, setUsePortrait] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [zoom, setZoom] = React.useState(1);
  const useSimpleViewer = React.useMemo(() => isIOS(), []);
  const renderScale = React.useMemo(() => resolveRenderScale(), []);
  const pdfRef = React.useRef<PDFDocumentProxy | null>(null);

  const pageAspect = React.useMemo(() => {
    if (pageAspectProp != null && pageAspectProp > 0) return pageAspectProp;
    if (pdfAspect != null && pdfAspect > 0) return pdfAspect;
    return 297 / 210;
  }, [pageAspectProp, pdfAspect]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = React.useRef<any>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    setPdfLoading(true);
    setRasterizing(false);
    setNumPages(0);
    setCurrentPage(0);
    setPdfAspect(null);
    setPageImages((prev) => {
      prev.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      return [];
    });
    pdfRef.current = null;

    const load = async () => {
      try {
        const pdf = await pdfjs.getDocument(fileUrl).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        const first = await pdf.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        if (vp.width > 0 && vp.height > 0) {
          setPdfAspect(vp.height / vp.width);
        }
        setNumPages(pdf.numPages);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      pdfRef.current = null;
    };
  }, [fileUrl]);

  React.useEffect(() => {
    const measure = () => {
      const isMobile = window.innerWidth < 768;
      setUsePortrait(isMobile);
      setPageSize(
        fitPageDimensions(
          window.innerWidth,
          window.innerHeight,
          pageAspect,
          isMobile,
        ),
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pageAspect]);

  const { width: pageWidth, height: pageHeight } = pageSize;

  React.useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || numPages <= 0 || pageWidth <= 0 || pageHeight <= 0) return;

    let cancelled = false;
    const bitmapHeight = Math.round(pageHeight * renderScale);

    const rasterize = async () => {
      setRasterizing(true);
      try {
        const urls: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const url = await rasterizePdfPage(pdf, i, bitmapHeight);
          urls.push(url);
          if (useSimpleViewer) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, 0);
            });
          }
        }
        if (cancelled) {
          urls.forEach((url) => {
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          });
          return;
        }
        setPageImages((prev) => {
          prev.forEach((url) => {
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          });
          return urls;
        });
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setRasterizing(false);
      }
    };

    void rasterize();
    return () => {
      cancelled = true;
    };
  }, [fileUrl, numPages, pageWidth, pageHeight, renderScale, useSimpleViewer]);

  React.useEffect(
    () => () => {
      pageImages.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    },
    [pageImages],
  );

  const flipNext = React.useCallback(() => {
    if (useSimpleViewer) {
      const step = usePortrait ? 1 : 2;
      setCurrentPage((p) => Math.min(numPages - 1, p + step));
      playPageFlipSound();
      return;
    }
    bookRef.current?.pageFlip()?.flipNext();
  }, [numPages, usePortrait, useSimpleViewer]);

  const flipPrev = React.useCallback(() => {
    if (useSimpleViewer) {
      const step = usePortrait ? 1 : 2;
      setCurrentPage((p) => Math.max(0, p - step));
      playPageFlipSound();
      return;
    }
    bookRef.current?.pageFlip()?.flipPrev();
  }, [usePortrait, useSimpleViewer]);

  const handleFlipState = React.useCallback((state: string) => {
    if (state === "user_fold" || state === "flipping") {
      playPageFlipSound();
    }
  }, []);

  const zoomIn = React.useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100));
  }, []);

  const zoomOut = React.useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100));
  }, []);

  const resetZoom = React.useCallback(() => setZoom(1), []);

  const isFirstSpread = currentPage === 0;
  const isLastSpread = usePortrait
    ? currentPage >= numPages - 1
    : currentPage >= numPages - 2;
  const totalSpreads = numPages > 0 ? Math.ceil(numPages / 2) : 0;
  const currentSpread = Math.ceil((currentPage + 1) / 2);

  const isLoading = pdfLoading || rasterizing;
  const ready =
    !isLoading &&
    !loadError &&
    numPages > 0 &&
    pageImages.length === numPages &&
    pageWidth > 0 &&
    pageHeight > 0;

  React.useEffect(() => {
    if (!ready) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !isFirstSpread) {
        e.preventDefault();
        primePageFlipSound();
        flipPrev();
      } else if (e.key === "ArrowRight" && !isLastSpread) {
        e.preventDefault();
        primePageFlipSound();
        flipNext();
      } else if ((e.key === "+" || e.key === "=") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        resetZoom();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ready, isFirstSpread, isLastSpread, flipPrev, flipNext, zoomIn, zoomOut, resetZoom]);

  const layoutWidth = usePortrait ? pageWidth : pageWidth * 2;
  const layoutHeight = pageHeight;
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div
      className="public-flipbook"
      aria-label={title ? `Reading ${title}` : "Reading book"}
      onPointerDown={primePageFlipSound}
    >
      {isLoading && !loadError ? (
        <div className="public-flipbook__loading">
          <div className="public-flipbook__spinner" aria-hidden />
          <p>{pdfLoading ? "Opening book…" : "Preparing pages…"}</p>
        </div>
      ) : null}

      {loadError ? (
        <div className="public-flipbook__error">
          <p>Could not load this book.</p>
        </div>
      ) : null}

      {ready ? (
        <>
          <span className="public-flipbook__hint">
            {useSimpleViewer
              ? "Swipe or use arrows · +/- to zoom"
              : "Drag corners to flip · +/- to zoom"}
          </span>
          <span className="public-flipbook__pager">
            {currentSpread} / {totalSpreads}
          </span>
          <div className="public-flipbook__zoom" role="toolbar" aria-label="Zoom controls">
            <button
              type="button"
              className="public-flipbook__zoom-btn"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="public-flipbook__zoom-label"
              onClick={resetZoom}
              disabled={zoom === 1}
              aria-label={`Zoom ${zoomLabel}, click to reset`}
              title="Reset zoom"
            >
              {zoomLabel}
            </button>
            <button
              type="button"
              className="public-flipbook__zoom-btn"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : null}

      <div
        className={`public-flipbook__stage${zoom > 1 ? " public-flipbook__stage--zoomed" : ""}`}
      >
        {ready ? (
          <div
            className="public-flipbook__book-scaler"
            style={{
              width: layoutWidth * zoom,
              height: layoutHeight * zoom,
            }}
          >
            <div
              className="public-flipbook__book"
              style={{
                width: layoutWidth,
                height: layoutHeight,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
            {useSimpleViewer ? (
              <SimpleSpreadViewer
                pageImages={pageImages}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                usePortrait={usePortrait}
                currentPage={currentPage}
                numPages={numPages}
                onPageChange={setCurrentPage}
              />
            ) : (
            <HTMLFlipBook
              key={`${pageWidth}x${pageHeight}-${usePortrait ? "p" : "l"}`}
              ref={bookRef}
              width={pageWidth}
              height={pageHeight}
              size="fixed"
              minWidth={pageWidth}
              maxWidth={pageWidth}
              minHeight={pageHeight}
              maxHeight={pageHeight}
              startPage={0}
              drawShadow
              flippingTime={900}
              usePortrait={usePortrait}
              startZIndex={20}
              autoSize={false}
              maxShadowOpacity={0.62}
              showCover={false}
              mobileScrollSupport
              clickEventForward={false}
              useMouseEvents
              swipeDistance={24}
              showPageCorners
              disableFlipByClick={false}
              onChangeState={(e: { data: string }) => handleFlipState(e.data)}
              onFlip={(e: { data: number }) => setCurrentPage(e.data)}
            >
              {pageImages.map((imageUrl, i) => (
                <PublicFlipPage
                  key={`${i}-${imageUrl.slice(0, 24)}`}
                  imageUrl={imageUrl}
                  slotWidth={pageWidth}
                  slotHeight={pageHeight}
                />
              ))}
            </HTMLFlipBook>
            )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
