import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2, Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UPLOADS_URL } from "@/constants/api";
import {
  useGetAccessibleCourseTypesQuery,
  useGetVideosByCourseTypeQuery,
} from "@/redux/services/apiSlices/vidLibrarySlice";

const PAGE_SIZE = 10;

type LibraryVideo = {
  id: string;
  title: string;
  courseType: string;
  src: string;
  thumbnail?: string;
};

type VidDoc = {
  _id: string;
  courseType: string;
  fileUrl: string;
  videoThumbnail?: string;
  title?: string;
};

function mapVidDoc(doc: VidDoc): LibraryVideo {
  return {
    id: doc._id,
    title: doc.title?.trim() || `${doc.courseType} video`,
    courseType: doc.courseType,
    src: `${UPLOADS_URL}${doc.fileUrl}`,
    thumbnail: doc.videoThumbnail ? `${UPLOADS_URL}${doc.videoThumbnail}` : undefined,
  };
}

function VideoLibraryCard({ item }: { item: LibraryVideo }) {
  const [playing, setPlaying] = useState(false);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPlayback = () => {
    const el = videoRef.current;
    if (!el) return;

    setPlaying(true);
    el.controls = true;

    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        toast.error("Could not start playback. Use the video controls below.");
      });
    }
  };

  const handleEnded = () => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      el.controls = false;
    }
    setPlaying(false);
  };

  const handleLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    const total = Math.floor(el.duration);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    setDurationLabel(`${mins}:${secs.toString().padStart(2, "0")}`);
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          className={cn(
            "h-full w-full bg-black",
            playing ? "object-contain" : "object-cover",
          )}
          poster={item.thumbnail}
          src={item.src}
          playsInline
          preload="metadata"
          controls={playing}
          title={item.title}
          onEnded={handleEnded}
          onLoadedMetadata={handleLoadedMetadata}
        >
          Your browser does not support the video tag.
        </video>

        {!playing && (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
              aria-hidden
            />
            <button
              type="button"
              onClick={startPlayback}
              className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-2 text-white transition hover:bg-black/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
              aria-label={`Play ${item.title}`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-500 text-white shadow-lg ring-4 ring-white/20 transition-transform hover:scale-105">
                <Play className="h-7 w-7 fill-current pl-0.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/90">
                Play video
              </span>
            </button>
            {durationLabel ? (
              <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
                {durationLabel}
              </span>
            ) : null}
          </>
        )}
      </div>
      <div className="space-y-1 border-t border-border/60 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{item.courseType}</p>
      </div>
    </Card>
  );
}

export default function VideoLibraryPage() {
  const [selectedCourseType, setSelectedCourseType] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: courseTypesRes,
    isLoading: courseTypesLoading,
    isError: courseTypesError,
    refetch: refetchCourseTypes,
  } = useGetAccessibleCourseTypesQuery();

  const courseTypes: string[] = useMemo(
    () => courseTypesRes?.data?.courseTypes ?? [],
    [courseTypesRes],
  );

  useEffect(() => {
    document.title = "Video Library • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if (!courseTypes.length) {
      setSelectedCourseType(null);
      return;
    }
    if (!selectedCourseType || !courseTypes.includes(selectedCourseType)) {
      setSelectedCourseType(courseTypes[0]);
      setPage(1);
    }
  }, [courseTypes, selectedCourseType]);

  const {
    data: videosRes,
    isLoading: videosLoading,
    isFetching: videosFetching,
    isError: videosError,
    refetch: refetchVideos,
  } = useGetVideosByCourseTypeQuery(
    { courseType: selectedCourseType!, page, limit: PAGE_SIZE },
    { skip: !selectedCourseType },
  );

  const listData = videosRes?.data;
  const videos: LibraryVideo[] = useMemo(
    () => (listData?.docs ?? []).map((doc: VidDoc) => mapVidDoc(doc)),
    [listData?.docs],
  );
  const totalPages = Math.max(1, Number(listData?.totalPages) || 1);
  const totalDocs =
    listData?.totalDocs != null ? Number(listData.totalDocs) : videos.length;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleCourseChange = (courseType: string) => {
    setSelectedCourseType(courseType);
    setPage(1);
  };

  const showVideosLoader = videosLoading || (videosFetching && !videos.length);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              "bg-lime-500/15 text-lime-600 dark:text-lime-400",
            )}
          >
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Video Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Training videos for your active LMS subscriptions.
            </p>
          </div>
        </div>

        {courseTypesLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your courses…
          </div>
        )}

        {courseTypesError && (
          <Card className="rounded-2xl border border-border/60 p-6">
            <p className="text-sm text-muted-foreground">Could not load your subscribed courses.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => refetchCourseTypes()}
            >
              Retry
            </Button>
          </Card>
        )}

        {!courseTypesLoading && !courseTypesError && courseTypes.length === 0 && (
          <Card className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No active LMS subscriptions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Subscribe to an LMS course to unlock videos for that program in your library.
            </p>
            <Button asChild variant="brand" size="pill" className="mt-6">
              <Link to="/subscribe-to-lms">Subscribe to LMS</Link>
            </Button>
          </Card>
        )}

        {courseTypes.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {courseTypes.map((ct) => {
                const active = ct === selectedCourseType;
                return (
                  <Button
                    key={ct}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "rounded-full",
                      active && "bg-lime-600 hover:bg-lime-600/90 text-white",
                    )}
                    onClick={() => handleCourseChange(ct)}
                  >
                    {ct}
                  </Button>
                );
              })}
            </div>

            {selectedCourseType && totalDocs > 0 ? (
              <p className="text-xs font-medium text-muted-foreground">
                {totalDocs} video{totalDocs === 1 ? "" : "s"} in {selectedCourseType} • page {page}{" "}
                of {totalPages}
              </p>
            ) : null}

            {showVideosLoader && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading videos…
              </div>
            )}

            {videosError && (
              <Card className="rounded-2xl border border-border/60 p-6">
                <p className="text-sm text-muted-foreground">Could not load videos for this course.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => refetchVideos()}
                >
                  Retry
                </Button>
              </Card>
            )}

            {!showVideosLoader && !videosError && videos.length === 0 && (
              <Card className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
                <Video className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No videos have been added for {selectedCourseType} yet.
                </p>
              </Card>
            )}

            {!videosError && videos.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((item) => (
                  <VideoLibraryCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {!videosError && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page <= 1 || videosFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page >= totalPages || videosFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
