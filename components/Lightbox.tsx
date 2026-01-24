"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { src: string; title: string; category: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, onPrev, onNext]);

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Image container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
          <img
            src={currentImage.src}
            alt={currentImage.title}
            className="max-w-full max-h-full object-contain select-none shadow-2xl"
          />
        </div>

        {/* Caption */}
        <div className="mt-6 text-center text-white">
          <h3 className="text-xl font-bold">{currentImage.title}</h3>
          <p className="text-emerald-400 font-medium mt-1">
            {currentImage.category}
          </p>
          <p className="text-white/50 text-sm mt-2">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
