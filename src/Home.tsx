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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
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
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + Math.min(allAnime.length, 10)) % Math.min(allAnime.length, 10));
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
            <div className="absolute inset-0 z-30 flex items-center">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center gap-4 text-sm">
                    <span className="bg-red-600 px-3 py-1 rounded-full font-semibold">
                      #{i + 1} Trending
                    </span>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{formatScore(anime.score)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{formatYear(anime.aired)}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
                    {anime.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                    {anime.synopsis}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {anime.type}
                    </span>
                    <span className="bg-purple-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {anime.episodes ?? "?"} eps
                    </span>
                    {anime.status && (
                      <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-medium">
                        {anime.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <Link
                      to={`/anime/${anime.mal_id}`}
                      className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
                    >
                      <Play className="w-5 h-5" />
                      Watch Now
                    </Link>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold transition-all duration-300 border border-white/30">
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        <div className="absolute bottom-8 right-8 z-40 flex items-center gap-3">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-3 rounded-full transition-all duration-300 border border-white/20"
            title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={prevSlide}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-3 rounded-full transition-all duration-300 border border-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-3 rounded-full transition-all duration-300 border border-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-2">
          {featuredAnime.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === slideIndex 
                  ? "bg-red-500 scale-125" 
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trending Anime Grid */}
      <section className="px-6 py-16 container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
              <span className="text-red-500">🔥</span>
              Trending Anime
            </h2>
            <p className="text-gray-400">Discover the most popular anime right now</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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