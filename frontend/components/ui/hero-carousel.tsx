'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: '/hero_1.png',
    title: 'Modern Healthcare Excellence',
    subtitle: 'Experience state-of-the-art medical facilities tailored for your well-being.',
  },
  {
    id: 2,
    image: '/hero_2.png',
    title: 'Expert Doctors at Your Service',
    subtitle: 'Book online consultations and get digital prescriptions instantly.',
  },
  {
    id: 3,
    image: '/hero_3.png',
    title: 'Seamless Digital Experience',
    subtitle: 'Manage your appointments, reports, and payments in one secure portal.',
  },
];

export function HeroCarousel({ id }: { id?: string }): JSX.Element {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section
      id={id}
      className="relative h-screen min-h-[600px] w-full overflow-hidden bg-slate-950 pt-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-20 flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="max-w-2xl transform transition-all duration-1000 translate-y-0 opacity-100">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {slide.title.split(' ')[0]}
                  </span>{' '}
                  {slide.title.split(' ').slice(1).join(' ')}
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/register"
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
                  >
                    Book an Appointment
                  </Link>
                  <Link
                    href="#services"
                    className="rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-4 text-base font-bold text-slate-300 backdrop-blur-sm transition-all hover:border-slate-500 hover:text-white"
                  >
                    Explore Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-slate-800 md:left-8 opacity-0 group-hover:opacity-100 lg:opacity-50 hover:!opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-slate-800 md:right-8 opacity-0 group-hover:opacity-100 lg:opacity-50 hover:!opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 transition-all duration-300 rounded-full ${
              index === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
