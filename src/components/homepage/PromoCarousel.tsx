"use client";

import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { PercentSquare, ChevronRight, Flame } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NextButton, PrevButton } from "./Carousel/EmblaCarouselArrowButtons";
import { DotButton } from "./Carousel/EmblaCarouselDotButton";
import Autoplay from "embla-carousel-autoplay"

const images = [
  {
    title: "Comfortable Stay Up to 25%",
    description: "Enjoy comfortable stay discount up to 25%...",
    image: "/images/carousel1.png", 
    color: "bg-blue-600"
  },
  {
    title: "New Year Deals 2026",
    description: "Start your new year with positive mind...",
    image: "/images/carousel2.png",
    color: "bg-emerald-600"
  },
  {
    title: "Travel more. pay less",
    description: "Release your stress...",
    image: "/images/carousel3.png",
    color: "bg-orange-600"
  },
  {
    title: "Beach escapes 2026",
    description: "Enjoy our 10% off...",
    image: "/images/carousel4.png",
    color: "bg-cyan-600"
  },
];

const PromoCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start" 
  }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="container mx-auto mt-16 max-w-7xl px-4 lg:px-0 mb-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Flame className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Special Deals For You 
              </h2>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            View all deals <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4">
            {images.map((item, index) => (
              <div className="min-w-0 flex-[0_0_90%] md:flex-[0_0_60%] lg:flex-[0_0_40%] pl-4" key={index}>
                <div className="group relative h-56 md:h-72 w-full overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl">
                  
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain md:object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <span className="inline-block w-fit px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-white bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                      Limited Offer
                    </span>
                    <h3 className="text-white text-xl md:text-2xl font-bold leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-2 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 items-center">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === selectedIndex 
                    ? "w-8 h-2 bg-primary" 
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <div className="scale-90 origin-right">
                <PrevButton onClick={scrollPrev} disabled={!emblaApi?.canScrollPrev()} />
                <NextButton onClick={scrollNext} disabled={!emblaApi?.canScrollNext()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;