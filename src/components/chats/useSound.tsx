// hooks/useSound.ts
"use client";

export function useSound(src: string) {
  const audio = typeof Audio !== "undefined" ? new Audio(src) : null;

  const play = () => {
    if (audio) {
      audio.currentTime = 0; // reset if already playing
      audio.play().catch((e) => {
        console.error("Audio play failed:", e);
      });
    }
  };

  return play;
}
