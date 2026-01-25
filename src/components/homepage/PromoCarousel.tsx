"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

const images = [
  { title: "25% Off Stays", desc: "Save big on your next trip", img: "/images/carousel1.png" },
  { title: "New Year 2026", desc: "New memories start here", img: "/images/carousel2.png" },
  { title: "Travel More", desc: "Pay less, see more of the world", img: "/images/carousel3.png" },
  { title: "Beach Deals", desc: "10% off all coastal homes", img: "/images/carousel4.png" },
];

const PromoCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="max-w-7xl mx-auto px-4 my-10">
      <div className="flex items-center gap-2 mb-4 border-b pb-2">
        <Flame className="text-orange-500" />
        <h2 className="text-xl font-bold">Special Deals</h2>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((item, index) => (
            <div 
              key={index} 
              className="relative flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_40%] min-w-0 pl-4"
            >
              <div className="relative h-40 md:h-52 w-full rounded-xl overflow-hidden bg-gray-200">
                <img 
                  src={item.img} 
                  className="w-full h-full object-cover" 
                  alt="promo" 
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${i === selectedIndex ? "w-6 bg-black" : "w-2 bg-gray-300"}`} 
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={scrollPrev} className="p-2 border rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollNext} className="p-2 border rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;