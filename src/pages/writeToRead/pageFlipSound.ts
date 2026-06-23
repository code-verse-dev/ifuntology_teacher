const FLIP_SOUND_SRC = "/flip.mp3";

let flipAudio: HTMLAudioElement | null = null;
let lastPlayedAt = 0;

function getFlipAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!flipAudio) {
    flipAudio = new Audio(FLIP_SOUND_SRC);
    flipAudio.preload = "auto";
    flipAudio.volume = 0.85;
  }
  return flipAudio;
}

/** Call on first user interaction so keyboard flips can play audio. */
export function primePageFlipSound(): void {
  const audio = getFlipAudio();
  if (!audio) return;
  if (audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    void audio.load();
  }
}

/** Play the page-turn sound from public/flip.mp3. */
export function playPageFlipSound(): void {
  const now = Date.now();
  if (now - lastPlayedAt < 180) return;
  lastPlayedAt = now;

  const template = getFlipAudio();
  if (!template) return;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  audio.volume = template.volume;
  void audio.play().catch(() => {
    /* autoplay policies may block until gesture */
  });
}
