import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback, useState } from "react";
import React, { ReactNode, HTMLAttributes } from 'react';
interface LinkProps extends HTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
  className?: string;
}
// Note: Replace with your actual Link component from react-router-dom
const Link: React.FC<LinkProps> = ({ to, children, className, ...props }) => (
  <a href={to} className={className} {...props}>{children}</a>
);
import { Play, Star, Calendar, Clock, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import Loader from "./components/ui/Loader";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

export function Home() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["trending-anime"],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${pageParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch trending anime.");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
  });

  const observerRef = useRef<HTMLDivElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [, setLoadedImages] = useState(new Set());
  const allAnime = data?.pages.flatMap((page) => page.data) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver]);

  // Auto-slideshow with pause/play functionality
  useEffect(() => {
    if (allAnime.length === 0 || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % Math.min(allAnime.length, 10));
    }, 6000);
    return () => clearInterval(interval);
  }, [allAnime.length, isAutoPlaying]);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % Math.min(allAnime.length, 10));
    setSynopsisExpanded(false);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + Math.min(allAnime.length, 10)) % Math.min(allAnime.length, 10));
    setSynopsisExpanded(false);
  };

  const handleImageLoad = (malId: number) => {
    setLoadedImages(prev => new Set([...prev, malId]));
  };

  const formatScore = (score: number) => {
    return score ? score.toFixed(1) : 'N/A';
  };

  const formatYear = (aired: { from?: string | null }) => {
    if (!aired?.from) return 'TBA';
    return new Date(aired.from).getFullYear();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#0f172a] to-[#1f2937] flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#0f172a] to-[#1f2937] flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">⚠️ Error loading anime</p>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const featuredAnime = allAnime.slice(0, 10);

  return (
    <main className="bg-gradient-to-b from-black via-[#0f172a] to-[#1f2937] text-white min-h-screen">
      {/* Hero Slideshow */}
      <section className="relative w-full h-screen overflow-hidden">
        {featuredAnime.map((anime, i) => (
          <div
            key={anime.mal_id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              i === slideIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 z-20"></div>
            
            <img
              src={anime.images.webp.large_image_url}
              alt={anime.title}
              className="w-full h-full object-cover object-center"
              loading={i === 0 ? "eager" : "lazy"}
              onLoad={() => handleImageLoad(anime.mal_id)}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 z-30 flex items-end sm:items-center pb-24 sm:pb-0">
              <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                <div className="max-w-2xl">
                  <div className="mb-3 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                    <span className="bg-red-600 px-2 py-1 sm:px-3 rounded-full font-semibold">
                      #{i + 1} Trending
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      <span className="font-semibold">{formatScore(anime.score)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatYear(anime.aired)}</span>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 text-white leading-tight">
                    {anime.title}
                  </h1>

                  <div className="hidden sm:block mb-4">
                    <p className={`text-base md:text-xl text-gray-300 leading-relaxed ${
                      synopsisExpanded ? '' : 'line-clamp-3'
                    }`}>
                      {anime.synopsis}
                    </p>
                    {anime.synopsis && anime.synopsis.length > 200 && (
                      <button
                        onClick={() => setSynopsisExpanded((prev) => !prev)}
                        className="mt-2 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-1"
                      >
                        {synopsisExpanded ? (
                          <>
                            View less
                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            View more
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-600 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
                      {anime.type}
                    </span>
                    <span className="bg-purple-600 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {anime.episodes ?? "?"} eps
                    </span>
                    {anime.status && (
                      <span className="bg-green-600 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
                        {anime.status}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/anime/${anime.mal_id}`}
                      className="bg-red-600 hover:bg-red-700 px-5 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm sm:text-base"
                    >
                      <Play className="w-4 h-4" />
                      Watch Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls — hidden on mobile */}
        <div className="hidden sm:flex absolute bottom-8 right-6 z-40 items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-300 border border-white/20"
            title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={prevSlide}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-300 border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-300 border border-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 sm:gap-2">
          {featuredAnime.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                i === slideIndex
                  ? "bg-red-500 scale-125"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trending Anime Grid */}
      <section className="px-4 sm:px-6 py-10 sm:py-16 container mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-white flex items-center gap-3">
              <span className="text-red-500">🔥</span>
              Trending Anime
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">Discover the most popular anime right now</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-orange-700 mb-2">Featured Anime</h2>
            <p className="text-gray-700 text-sm">Discover the latest and most popular anime series.</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Your Recommendations</h2>
            <p className="text-gray-700 text-sm">Personalized suggestions based on your preferences.</p>
          </div>
          {/* Add two more cards for demonstration or leave empty for now */}
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Community</h2>
            <p className="text-gray-700 text-sm">Join discussions with fellow anime fans.</p>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-purple-700 mb-2">Events</h2>
            <p className="text-gray-700 text-sm">See upcoming anime events and news.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {allAnime.map((anime, index) => (
            <Card
              key={anime.mal_id}
              className="group relative overflow-hidden rounded-xl border border-gray-800 transition-all duration-300 hover:border-red-500/50 hover:scale-[1.02] bg-[#0e0e0e] text-white hover:shadow-2xl hover:shadow-red-500/20"
            >
              <div className="relative overflow-hidden">
                <img
                  src={anime.images.webp.large_image_url}
                  alt={anime.title}
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <Link
                    to={`/anime/${anime.mal_id}`}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 flex items-center gap-2 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Watch
                  </Link>
                </div>

                {/* Rank Badge */}
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                  #{index + 1}
                </div>

                {/* Score Badge */}
                {anime.score && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-lg text-sm font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {formatScore(anime.score)}
                  </div>
                )}
              </div>

              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold line-clamp-2 text-white group-hover:text-red-400 transition-colors duration-300">
                  <Link to={`/anime/${anime.mal_id}`} className="hover:underline">
                    {anime.title}
                  </Link>
                </CardTitle>

                <CardDescription className="text-sm text-gray-400 mt-2 flex items-center gap-3">
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                    {anime.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {anime.episodes ?? "?"} eps
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatYear(anime.aired)}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                  {anime.synopsis}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading/End Indicator */}
        <div ref={observerRef} className="h-20 mt-12 flex items-center justify-center text-gray-400">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3">
              <Loader />
              <p>Loading more anime...</p>
            </div>
          )}
          {!hasNextPage && allAnime.length > 0 && (
            <p className="text-center">
              🎉 You've reached the end! That's all the trending anime for now.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}