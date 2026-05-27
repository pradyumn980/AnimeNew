import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Star, ExternalLink, RefreshCw, Lock, Loader2, Play } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import TasteQuizModal from "./components/TasteQuizModal";

interface Recommendation {
  title: string;
  title_english: string;
  reason: string;
  mal_id: number | null;
  synopsis: string;
  score: number | null;
  episodes: number | null;
  status: string;
  year: number | null;
  genres: string[];
  image: string | null;
  url: string | null;
}

interface SavedPrefs {
  favoriteGenres: string[];
  mood: string;
  favoriteAnimes: string[];
  lastRecommendations?: Recommendation[];
  lastRecommendedAt?: string;
}

// Skeleton card shown while loading
function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-52 bg-white/10" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-12 bg-white/10 rounded" />
        <div className="h-10 bg-white/10 rounded" />
      </div>
    </div>
  );
}

// Premium lock screen for free users
function PremiumGate() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1a0a2e] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shadow-2xl shadow-yellow-500/20">
          <Lock className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-3">
          Premium Feature
        </h1>
        <p className="text-white/60 text-base mb-2 leading-relaxed">
          AI-powered anime recommendations are exclusive to <strong className="text-white">AnimeFinder Premium</strong> members.
        </p>
        <p className="text-white/40 text-sm mb-8">
          Get personalised picks tailored to your exact taste — powered by Google Gemini AI.
        </p>
        <button
          type="button"
          onClick={() => navigate("/pricing")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-xl hover:shadow-yellow-500/30 hover:scale-105"
        >
          <Crown className="w-5 h-5" /> Unlock Premium
        </button>
        <p className="text-white/25 text-xs mt-4">From ₹99/month · Cancel anytime</p>
      </motion.div>
    </div>
  );
}

export default function Recommendations() {
  const { user } = useAuth();
  const [quizOpen, setQuizOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [savedPrefs, setSavedPrefs] = useState<SavedPrefs | null>(null);
  const [error, setError] = useState("");
  const [fetchingPrefs, setFetchingPrefs] = useState(true);

  // Load saved preferences and cached recommendations on mount
  useEffect(() => {
    (async () => {
      if (!user?.isPremium) { setFetchingPrefs(false); return; }
      try {
        const { data } = await axios.get("/api/ai/preferences");
        if (data.preferences) {
          setSavedPrefs(data.preferences);
          if (data.preferences.lastRecommendations?.length) {
            setRecs(data.preferences.lastRecommendations);
          }
        }
      } catch {
        // no prefs yet
      } finally {
        setFetchingPrefs(false);
      }
    })();
  }, [user]);

  const handleQuizSubmit = async (prefs: { genres: string[]; mood: string; favoriteAnimes: string[] }) => {
    setQuizOpen(false);
    setLoading(true);
    setError("");
    setRecs([]);
    try {
      const { data } = await axios.post("/api/ai/recommend", prefs);
      setRecs(data.recommendations ?? []);
      setSavedPrefs((prev) => ({ ...prev, ...prefs } as SavedPrefs));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isPremium) return <PremiumGate />;

  const hasPrefs = savedPrefs && (savedPrefs.favoriteGenres?.length || savedPrefs.favoriteAnimes?.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1a0a2e] px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-400 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> Powered by Google Gemini AI
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-red-400 to-amber-400 bg-clip-text text-transparent mb-3">
          Your AI Recommendations 🤖
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/50 text-base max-w-lg mx-auto">
          Tell us your taste and our AI will find your next obsession — with personalised reasons just for you.
        </motion.p>
      </div>

      {/* CTA buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-xl hover:shadow-purple-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          {hasPrefs && recs.length ? "Update My Taste" : "Get My Recommendations"}
        </button>
        {recs.length > 0 && (
          <button
            type="button"
            onClick={() => setQuizOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium px-5 py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Picks
          </button>
        )}
      </motion.div>

      {/* Saved taste summary */}
      {hasPrefs && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Your taste:</span>
          {savedPrefs?.favoriteGenres?.slice(0, 5).map((g) => (
            <span key={g} className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2.5 py-0.5">{g}</span>
          ))}
          {savedPrefs?.mood && (
            <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2.5 py-0.5">
              Mood: {savedPrefs.mood.split(" ").slice(0, 3).join(" ")}…
            </span>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-purple-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Gemini is analysing your taste and fetching anime posters…
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !recs.length && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">No recommendations yet</h2>
          <p className="text-white/40 text-sm">Click "Get My Recommendations" to start your taste quiz.</p>
        </motion.div>
      )}

      {/* Recommendation grid */}
      {!loading && recs.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-white/30 text-xs mb-6 uppercase tracking-widest">
            {recs.length} personalised picks — just for you
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recs.map((rec, i) => (
              <motion.div key={rec.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10"
              >
                {/* Poster */}
                <div className="relative h-52 bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 overflow-hidden">
                  {rec.image ? (
                    <img
                      src={rec.image}
                      alt={rec.title_english}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Play className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Score badge */}
                  {rec.score && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-bold">{rec.score}</span>
                    </div>
                  )}

                  {/* AI pick badge */}
                  <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                    <span className="text-white text-[10px] font-bold">AI Pick #{i + 1}</span>
                  </div>

                  {/* Year */}
                  {rec.year && (
                    <div className="absolute bottom-2 right-2 text-white/60 text-[10px]">{rec.year}</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{rec.title_english || rec.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {rec.genres.slice(0, 3).map((g) => (
                        <span key={g} className="text-[10px] text-purple-300 bg-purple-500/15 rounded-full px-1.5 py-0.5">{g}</span>
                      ))}
                      {rec.episodes && (
                        <span className="text-[10px] text-white/30 bg-white/5 rounded-full px-1.5 py-0.5">{rec.episodes} eps</span>
                      )}
                    </div>
                  </div>

                  {/* AI reason */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <p className="text-[10px] text-purple-300 font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Why for you
                    </p>
                    <p className="text-white/70 text-xs leading-relaxed">{rec.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    {rec.mal_id ? (
                      <Link
                        to={`/anime/${rec.mal_id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30"
                      >
                        <Play className="w-3.5 h-3.5" /> Details
                      </Link>
                    ) : (
                      <a
                        href={rec.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-2.5 rounded-xl transition-all duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> MAL
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-center text-white/20 text-xs mt-10">
            🤖 Recommendations generated by Gemini AI · Artwork from MyAnimeList via Jikan API
          </motion.p>
        </div>
      )}

      {/* Taste Quiz Modal */}
      <AnimatePresence>
        {quizOpen && (
          <TasteQuizModal
            initialPrefs={savedPrefs ? {
              genres: savedPrefs.favoriteGenres,
              mood: savedPrefs.mood,
              favoriteAnimes: savedPrefs.favoriteAnimes,
            } : undefined}
            onSubmit={handleQuizSubmit}
            onClose={() => setQuizOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
