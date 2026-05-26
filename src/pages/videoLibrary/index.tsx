import { useEffect, useRef, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


type LibraryVideo = {
  id: string;
  title: string;
  description: string;
  src: string;
  thumbnail: string;
  duration: string;
};

/** Small, widely reachable sample files for local/demo playback */
const DUMMY_VIDEOS: LibraryVideo[] = [
  {
    id: "1",
    title: "Welcome to iFuntology Teacher",
    description: "A quick tour of your teacher dashboard and main menu.",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    duration: "0:10",
  },
  {
    id: "2",
    title: "How to invite students",
    description: "Step-by-step guide to email and manual student invitations.",
    src: "https://www.w3schools.com/html/movie.mp4",
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    duration: "0:12",
  },
  {
    id: "3",
    title: "Booking a session with admin",
    description: "Request sessions, pick time slots, and join approved meetings.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://picsum.photos/seed/ifunto-session/640/360",
    duration: "0:15",
  },
  {
    id: "4",
    title: "Using the enrichment store",
    description: "Browse products, build a cart, and complete checkout.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://picsum.photos/seed/ifunto-store/640/360",
    duration: "0:15",
  },
  {
    id: "5",
    title: "LMS course overview",
    description: "Subscribe to LMS, assign courses, and track student progress.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://picsum.photos/seed/ifunto-lms/640/360",
    duration: "1:00",
  },
  {
    id: "6",
    title: "Write to Read batch setup",
    description: "Create batches and invite students to Write to Read.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://picsum.photos/seed/ifunto-wtr/640/360",
    duration: "0:15",
  },
];

function VideoLibraryCard({ item }: { item: LibraryVideo }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPlayback = () => {
    const el = videoRef.current;
    if (!el) return;

    setPlaying(true);
    el.controls = true;

    // Must call play() in the same user-gesture turn (not in useEffect).
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

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          className={cn(
            "h-full w-full bg-black",
            playing ? "object-contain" : "object-cover"
          )}
          poster={item.thumbnail}
          src={item.src}
          playsInline
          preload="metadata"
          controls={playing}
          title={item.title}
          onEnded={handleEnded}
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
            <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
              {item.duration}
            </span>
          </>
        )}
      </div>
      <div className="space-y-1 border-t border-border/60 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </Card>
  );
}

export default function VideoLibraryPage() {
  useEffect(() => {
    document.title = "Video Library • iFuntology Teacher";
  }, []);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              "bg-lime-500/15 text-lime-600 dark:text-lime-400"
            )}
          >
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Video Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Click a thumbnail to play. Sample training videos for teachers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DUMMY_VIDEOS.map((item) => (
            <VideoLibraryCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
