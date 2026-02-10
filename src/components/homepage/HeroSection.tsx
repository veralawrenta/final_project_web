"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

const destinations = [
  {
    id: 1,
    image: "/images/hero1.jpg",
    title: "Discover Beachside Spots",
    subtitle: "Unwind in the world's most stunning coastal retreats.",
  },
  {
    id: 2,
    image: "/images/hero2.jpg",
    title: "Explore Mountain Escapes",
    subtitle: "Find tranquility in breathtaking alpine getaways.",
  },
  {
    id: 3,
    image: "/images/hero3.jpg",
    title: "Experience Urban Adventures",
    subtitle: "Dive into the heart of vibrant city life.",
  },
  {
    id: 4,
    image: "/images/hero4.jpg",
    title: "Relax in Serene Countrysides",
    subtitle: "Reconnect with nature in peaceful rural settings.",
  },
];

const HeroSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => emblaApi?.scrollPrev();
  const goToNext = () => emblaApi?.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section className="relative container mx-auto max-w-full h-[60vh] overflow-hidden mt-13">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {destinations.map((dest) => (
            <div key={dest.id} className="embla__slide min-w-full h-full relative">
              <img
                src={dest.image}
                alt={dest.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
        <div className="max-w-xl animate-slide-up ml-10">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium bg-primary/90 text-primary-foreground rounded-full">
            Featured Destination
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-card mb-2">
            {destinations[currentIndex].title}
          </h1>
          <p className="text-lg md:text-xl text-card/80 mb-6">
            {destinations[currentIndex].subtitle}
          </p>
          <Button size="lg" className= "font-bold">Book Now</Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-8">
          <Button variant="ghost" size="icon" onClick={goToPrev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2">
            {destinations.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-primary w-8" : "bg-card/50"
                }`}
              />
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={goToNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
