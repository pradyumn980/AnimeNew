import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Filter, Clock, Star, Play, Calendar, Users, Loader2, ExternalLink } from "lucide-react";
import Loader from "./components/ui/Loader";
import { Link } from 'react-router-dom'; // Ensure Link is imported

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

// Types
type Anime = {
  mal_id: number;
  title: string;
  type: string;
  episodes: number;
  duration: string;
  url: string;
  images: {
    webp: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  year: number;
  status: string;
  genres?: Array<{
    mal_id: number;
    name: string;
  }>;
  studios?: Array<{
    mal_id: number;
    name: string;
  }>;
};

type FormValue = {
  search: string;
  type: string;
  status: string;
};

function AnimeCard({ anime, onViewDetails }: { anime: Anime; onViewDetails: (anime: Anime) => void }) {
  
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-800 transition-all duration-300 hover:border-red-500/50 hover:scale-[1.01] bg-[#0e0e0e] text-white hover:shadow-xl hover:shadow-red-500/20">
      {/* Animated Background Gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div> */}
      
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          alt={anime.title}
          className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
          src={anime.images.webp.large_image_url || anime.images.webp.image_url}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/300x400/1a365d/ffffff?text=No+Image";
          }}
        />
        
        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-all duration-500" />
        
        {/* Floating Info Tags */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 backdrop-blur-md text-xs font-bold rounded-full shadow-lg border border-red-400/30 transform transition-all duration-300 group-hover:scale-110">
            {anime.type}
          </span> */}
          {anime.score && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black backdrop-blur-md text-xs font-bold rounded-full flex items-center gap-1 shadow-lg border border-amber-400/30 transform transition-all duration-300 group-hover:scale-110">
              <Star size={12} className="text-black" />
              {anime.score}
            </span>
          )}
        </div>

        {/* Watch Button - Similar to Home.tsx */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-20">
                          <Link
                            to={`/anime/${anime.mal_id}`}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 flex items-center gap-2 text-sm"
                          >
                            <Play className="w-4 h-4" />
                            Watch
                          </Link>
                        </div>
        
        {/* Glowing Effect */}
        {/* <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
        </div> */}
      </div>

      {/* Content */}
      <div className="relative p-3 space-y-2">
        {/* Title with Glow Effect */}
        <Link to={`/anime/${anime.mal_id}`} className="text-base font-semibold line-clamp-2 text-white group-hover:text-red-400 transition-colors duration-300 hover:underline">
                    {anime.title}
                  </Link>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-slate-300 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-violet-400" />
            {anime.type}
          </span>
          {anime.episodes && (
            <>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <Users size={14} className="text-violet-400" />
                {anime.episodes} eps
              </span>
            </>
          )}
          {anime.duration && (
            <>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-violet-400" />
                {anime.duration}
              </span>
            </>
          )}
        </div>

        {/* Status and Year */}
        <div className="flex items-center justify-between">
          <span className={`px-4 py-2 text-xs font-bold rounded-full shadow-lg border transition-all duration-300 ${
            anime.status === 'Currently Airing' 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-400/30 shadow-emerald-500/30' :
            anime.status === 'Finished Airing' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400/30 shadow-blue-500/30' :
              'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400/30 shadow-orange-500/30'
          }`}>
            {anime.status}
          </span>
          
          {anime.year && (
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600/50">
              {anime.year}
            </span>
          )}
        </div>

        {/* Synopsis */}
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 group-hover:text-slate-200 transition-colors duration-300">
          {anime.synopsis || "No synopsis available."}
        </p>
      </div>

      {/* Bottom Glow Effect */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> */}
    </div>
  );
}

function AnimeList({ animeList, loading, onViewDetails }: { 
  animeList: Anime[]; 
  loading: boolean;
  onViewDetails: (anime: Anime) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 ">
        <Loader />
        <p className="text-slate-300 text-lg mt-4">Searching for anime...</p>
      </div>
    );
  }

  if (animeList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30">
            <X size={40} className="text-white" />
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-300 via-pink-300 to-red-300 bg-clip-text text-transparent mb-2">
          No Results Found
        </h3>
        <p className="text-slate-400 text-lg mb-4">Try adjusting your search terms</p>
        <p className="text-slate-500 text-sm">Check spelling or use different keywords</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
          Found {animeList.length} result{animeList.length !== 1 ? 's' : ''}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {animeList.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} onViewDetails={onViewDetails} />
        ))}
      </div>
    </div>
  );
}

export default function Anime() {
  const navigate = useNavigate();
  
  // Restore search params and results from localStorage if available
  const [searchParams, setSearchParams] = useState<FormValue>(() => {
    try {
      const stored = localStorage.getItem('animeSearchParams');
      return stored ? JSON.parse(stored) : { search: "", type: "", status: "" };
    } catch {
      return { search: "", type: "", status: "" };
    }
  });
  const [animeList, setAnimeList] = useState<Anime[]>(() => {
    try {
      const stored = localStorage.getItem('animeSearchResults');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [hasSearched, setHasSearched] = useState(() => {
    try {
      const stored = localStorage.getItem('animeSearchResults');
      return stored && JSON.parse(stored).length > 0;
    } catch {
      return false;
    }
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Scroll to top when search results are shown
  useEffect(() => {
    if (hasSearched) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasSearched]);

  // Persist search params and results to localStorage
  useEffect(() => {
    if (hasSearched) {
      localStorage.setItem('animeSearchParams', JSON.stringify(searchParams));
      localStorage.setItem('animeSearchResults', JSON.stringify(animeList));
    }
  }, [animeList, searchParams, hasSearched]);

  const searchAnime = async () => {
    const search = searchParams.search.trim();
    if (!search) return;

    setLoading(true);
    setHasSearched(true);
    updateSearchHistory(search);

    try {
      // Build API URL
      let apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=25`;
      
      if (searchParams.type) {
        apiUrl += `&type=${searchParams.type}`;
      }
      
      if (searchParams.status) {
        apiUrl += `&status=${searchParams.status}`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch anime data');
      }

      const data = await response.json();
      
      // Transform the data to match our Anime type
      const transformedData: Anime[] = data.data.map((item: any) => ({
        mal_id: item.mal_id,
        title: item.title,
        type: item.type,
        episodes: item.episodes,
        duration: item.duration,
        url: item.url,
        images: {
          webp: {
            image_url: item.images.webp.image_url,
            large_image_url: item.images.webp.large_image_url
          }
        },
        synopsis: item.synopsis,
        score: item.score,
        year: item.year,
        status: item.status,
        genres: item.genres,
        studios: item.studios
      }));

      setAnimeList(transformedData);
      // Persist results and params
      localStorage.setItem('animeSearchParams', JSON.stringify(searchParams));
      localStorage.setItem('animeSearchResults', JSON.stringify(transformedData));
    } catch (error) {
      console.error('Error fetching anime:', error);
      setAnimeList([]);
      localStorage.setItem('animeSearchResults', JSON.stringify([]));
    } finally {
      setLoading(false);
    }
  };

  const updateSearchHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter((item) => item !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    // Optional: Persist to localStorage
    // localStorage.setItem('animeSearchHistory', JSON.stringify(newHistory));
  };

  const handleHistoryClick = (term: string) => {
    setSearchParams((prev) => ({ ...prev, search: term }));
    searchAnime(); // Automatically trigger search when history item is clicked
  };

  const clearHistory = () => {
    setSearchHistory([]);
    // Optional: Clear from localStorage
    // localStorage.removeItem('animeSearchHistory');
  };

  // This function is still useful if you have other ways to view details,
  // but for the Play button, we'll use Link directly.
  const handleViewDetails = (anime: Anime) => {
    navigate(`/anime/${anime.mal_id}`);
  };

  const handleBackToSearch = () => {
    setAnimeList([]);
    setHasSearched(false);
    setSearchParams(prev => ({ ...prev, search: "", type: "", status: "" })); // Clear search input
    // Clear persisted search
    localStorage.removeItem('animeSearchParams');
    localStorage.removeItem('animeSearchResults');
  };

  return(
  <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header with Gradient Text */}
        <div className="text-center mb-12">
          {/* Reduce header size */}
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
            ANIME SEARCH
          </h1>
          {/* Reduce header size */}
          <p className="text-slate-300 text-base font-light">Discover your next adventure</p>
          {/* Reduce header size */}
          <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Show back button on results page */}
        {hasSearched && (
          <button
            onClick={handleBackToSearch}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl transition-all duration-300 border border-slate-700/50 hover:border-violet-500/50"
          >
            <X size={20} />
            New Search
          </button>
        )}

        {/* Enhanced Search Form */}
        {/* Reduce padding and margin in search form */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-xl mb-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search for anime..."
              className="flex-grow h-10 bg-slate-700/50 border-2 border-slate-600/50 text-white placeholder-slate-400 px-4 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 text-base backdrop-blur-sm min-w-0"
              value={searchParams.search}
              onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
            />
            {/* Type Filter */}
            <select
              className="flex-shrink-0 h-10 bg-slate-700/50 border-2 border-slate-600/50 text-white px-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm min-w-[140px] text-base"
              value={searchParams.type}
              onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="tv">TV Series</option>
              <option value="movie">Movies</option>
              <option value="ova">OVA</option>
              <option value="special">Specials</option>
            </select>
            {/* Status Filter */}
            <select
              className="flex-shrink-0 h-10 bg-slate-700/50 border-2 border-slate-600/50 text-white px-4 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 backdrop-blur-sm min-w-[140px] text-base"
              value={searchParams.status}
              onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="airing">Currently Airing</option>
              <option value="complete">Completed</option>
              <option value="upcoming">Coming Soon</option>
            </select>
            {/* Search Button */}
            <button
              onClick={searchAnime}
              disabled={loading}
              className="flex-shrink-0 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-105 transform font-semibold text-base disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Enhanced Search History - Only show when not showing results */}
        {!hasSearched && searchHistory.length > 0 && (
          <div className="bg-slate-800/20 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/30 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-300 font-semibold flex items-center gap-2">
                <Clock size={18} className="text-violet-400" />
                Recent Searches
              </h3>
              <button
                onClick={clearHistory}
                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm hover:scale-105 transform"
              >
                <X size={16} />
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-violet-600/50 hover:to-purple-600/50 text-white rounded-full transition-all duration-300 text-sm border border-slate-600/50 hover:border-violet-500/50 hover:scale-105 transform backdrop-blur-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show search prompt or results */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-2xl shadow-violet-500/30">
                <Search size={40} className="text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-30 animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent mb-2">
              Discover Amazing Anime
            </h3>
            <p className="text-slate-400 text-lg mb-4">Search for your next favorite series</p>
            <p className="text-slate-500 text-sm">Try searching for "Naruto", "Attack on Titan", or "One Piece"</p>
          </div>
        )}

        
        {/* Anime Results */}
        {hasSearched && (
          <AnimeList 
            animeList={animeList} 
            loading={loading} 
            onViewDetails={handleViewDetails} 
          />
        )}
      
    </div>
      
    </div>
  );
}