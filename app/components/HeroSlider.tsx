"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const slides = [
  {
    id: 1,
    image: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
    alt: "Everything Your Beauty Needs Under One Place - Shree Ambika Beauty Shop",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-2_rtcjzp.png",
    alt: "Discount is Your Right - Shree Ambika Beauty Shop",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-3_gqqquq.png",
    alt: "We Are Everywhere To Serve You - Shree Ambika Beauty Shop",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-brand-light" aria-label="Hero Banner Slider">
      {/* Slides */}
      <div className="relative w-full">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`transition-all duration-700 ease-in-out ${
              idx === current
                ? "opacity-100 scale-100"
                : "opacity-0 scale-[1.01] absolute inset-0"
            }`}
            aria-hidden={idx !== current}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              width={1920}
              height={680}
              priority={idx === 0}
              className="w-full h-auto object-cover"
              quality={90}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-primary rounded-full p-2 md:p-3 shadow-md transition-all hover:scale-110 z-10"
      >
        <FaChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-primary rounded-full p-2 md:p-3 shadow-md transition-all hover:scale-110 z-10"
      >
        <FaChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`rounded-full transition-all duration-300 ${
              idx === current
                ? "bg-brand-primary w-6 h-2.5"
                : "bg-brand-primary/40 w-2.5 h-2.5"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
