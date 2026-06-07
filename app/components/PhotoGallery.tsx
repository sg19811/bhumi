"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Photo grid (matching the previous detail-page layout) where any photo opens a
 * full-screen lightbox carousel with prev/next, close, and keyboard support.
 */
export default function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const shown = photos.slice(0, 5);
  const open = index !== null;
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Move focus into the lightbox on open; restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();
    return () => lastFocused.current?.focus?.();
  }, [open]);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % photos.length)), [photos.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, prev, next]);

  return (
    <>
      <div className={`mb-6 grid gap-2 overflow-hidden rounded-2xl ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4 md:grid-rows-2"}`}>
        {shown.map((p, i) => {
          const featured = photos.length > 1 && i === 0;
          const showMore = i === 4 && photos.length > 5;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`group relative cursor-zoom-in bg-green-50 ${featured ? "aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto" : "aspect-[4/3]"}`}
            >
              <Image
                src={p}
                alt={`${title} — photo ${i + 1}`}
                fill
                sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                priority={i === 0}
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {showMore && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                  +{photos.length - 5} more
                </span>
              )}
            </button>
          );
        })}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
        >
          <button
            ref={closeBtnRef}
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:left-6"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:right-6"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[index]}
              alt={`${title} — photo ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {index + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}
