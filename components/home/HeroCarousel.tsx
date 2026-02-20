"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const SLIDES = [
  { id: "1", url: "/hero/slide-5.png", alt: "Sam Sian カシューナッツ商品" },
  { id: "2", url: "/hero/slide-2.png", alt: "カシューナッツの収穫と選別" },
  { id: "3", url: "/hero/slide-3.png", alt: "カシューナッツの実" },
  { id: "4", url: "/hero/slide-4.png", alt: "丁寧な手作業" },
  { id: "5", url: "/hero/slide-1.png", alt: "Sam Sian パッケージ商品" },
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
