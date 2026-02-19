"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const SLIDES = [
  { id: "1", url: "https://picsum.photos/seed/cashew1/1200/514", alt: "Hero 1" },
  { id: "2", url: "https://picsum.photos/seed/cashew2/1200/514", alt: "Hero 2" },
  { id: "3", url: "https://picsum.photos/seed/cashew3/1200/514", alt: "Hero 3" },
];

export default function HeroCarousel() {
  return (
    <section className="w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        className="!pb-10"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full aspect-[4/5] sm:aspect-[21/9] max-h-[70vh] sm:max-h-[50vh] bg-gray-200">
              <img
                src={slide.url}
                alt={slide.alt}
                className="absolute inset-0 w-full h-full object-cover"
                sizes="100vw"
                fetchPriority="high"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
