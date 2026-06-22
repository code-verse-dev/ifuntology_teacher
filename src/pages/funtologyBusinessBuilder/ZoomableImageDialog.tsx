import { useCallback, useEffect, useRef, useState } from "react";
import { Hand, Minus, Plus, RotateCcw, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ZoomableImageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
  title: string;
};

type FitSize = { width: number; height: number };
type Tool = "zoom" | "pan";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.35;
const DRAG_THRESHOLD = 4;

export default function ZoomableImageDialog({
  open,
  onOpenChange,
  src,
  alt,
  title,
}: ZoomableImageDialogProps) {
  const [scale, setScale] = useState(MIN_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [fitSize, setFitSize] = useState<FitSize>({ width: 0, height: 0 });
  const [activeTool, setActiveTool] = useState<Tool>("zoom");
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    moved: false,
  });

  const resetView = useCallback(() => {
    setScale(MIN_SCALE);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const updateLayout = useCallback(() => {
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!img?.naturalWidth || !img.naturalHeight || !viewport) return;

    const maxW = Math.max(viewport.clientWidth - 32, 1);
    const maxH = Math.max(viewport.clientHeight - 32, 1);
    const ratio = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight,
      1,
    );

    setFitSize({
      width: Math.round(img.naturalWidth * ratio),
      height: Math.round(img.naturalHeight * ratio),
    });
  }, []);

  useEffect(() => {
    if (!open) {
      resetView();
      setFitSize({ width: 0, height: 0 });
      setActiveTool("zoom");
    }
  }, [open, src, resetView]);

  useEffect(() => {
    if (!open) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => updateLayout());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [open, updateLayout]);

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, deltaScale: number) => {
      const viewport = viewportRef.current;
      if (!viewport || fitSize.width === 0) return;

      const rect = viewport.getBoundingClientRect();
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;

      setScale((prevScale) => {
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, +(prevScale + deltaScale).toFixed(2)),
        );
        if (nextScale === prevScale) return prevScale;

        const ratio = nextScale / prevScale;
        setTranslate((prev) => ({
          x: px - (px - prev.x) * ratio,
          y: py - (py - prev.y) * ratio,
        }));
        return nextScale;
      });
    },
    [fitSize.width],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomAtPoint(e.clientX, e.clientY, delta);
    },
    [zoomAtPoint],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (fitSize.width === 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTx: translate.x,
      startTy: translate.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      drag.moved = true;
    }

    if (drag.moved && (activeTool === "pan" || scale > MIN_SCALE)) {
      setTranslate({
        x: drag.startTx + dx,
        y: drag.startTy + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (!drag.moved && activeTool === "zoom") {
      zoomAtPoint(e.clientX, e.clientY, ZOOM_STEP);
    }

    dragRef.current.pointerId = -1;
  };

  const zoomIn = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, ZOOM_STEP);
  };

  const zoomOut = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      -ZOOM_STEP,
    );
  };

  const cursor =
    activeTool === "zoom" && !isDragging
      ? "zoom-in"
      : isDragging
        ? "grabbing"
        : scale > MIN_SCALE || activeTool === "pan"
          ? "grab"
          : "default";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(96vw,1100px)] max-w-none flex-col gap-3 p-4 sm:p-6">
        <DialogHeader className="shrink-0 pr-8 text-left">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={activeTool === "zoom" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("zoom")}
            title="Click anywhere on the image to zoom in"
          >
            <ZoomIn className="mr-1 h-4 w-4" />
            Zoom
          </Button>
          <Button
            type="button"
            variant={activeTool === "pan" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("pan")}
            title="Drag to move the image"
          >
            <Hand className="mr-1 h-4 w-4" />
            Pan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={zoomIn}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          <span className="text-xs text-muted-foreground sm:ml-1">
            {Math.round(scale * 100)}%
            {activeTool === "zoom"
              ? " — click to zoom in, drag to pan when zoomed"
              : " — drag to move the image"}
          </span>
        </div>

        <div
          ref={viewportRef}
          className={cn(
            "relative h-[min(68vh,calc(92vh-11rem))] min-h-[280px] overflow-hidden rounded-lg border border-border/60 bg-muted/30",
            activeTool === "zoom" && "ring-1 ring-primary/20",
          )}
          onWheel={handleWheel}
        >
          {fitSize.width > 0 && (
            <div
              className="absolute left-1/2 top-1/2 touch-none select-none"
              style={{
                width: fitSize.width,
                height: fitSize.height,
                transform: `translate(calc(-50% + ${translate.x}px), calc(-50% + ${translate.y}px)) scale(${scale})`,
                cursor,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={src}
                alt={alt}
                draggable={false}
                onLoad={updateLayout}
                className="pointer-events-none block h-full w-full max-w-none"
              />
            </div>
          )}

          {fitSize.width === 0 && (
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              draggable={false}
              onLoad={updateLayout}
              className="absolute left-1/2 top-1/2 max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 object-contain opacity-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
