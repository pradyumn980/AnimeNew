import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Search, Loader2 } from "lucide-react";

interface Props {
  initialPrefs?: { genres: string[]; mood: string; favoriteAnimes: string[] };
  onSubmit: (prefs: { genres: string[]; mood: string; favoriteAnimes: string[] }) => void;
  onClose: () => void;
}

const GENRE_OPTIONS = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller", "Psychological", "Mecha",
  "Historical", "Music", "Isekai", "Shounen", "Seinen",
];

const MOOD_OPTIONS = [
  { label: "😂 Make me laugh",      value: "comedy and lighthearted fun" },
  { label: "😮 Blow my mind",       value: "mind-bending twists and deep lore" },
  { label: "😢 Hit me in the feels", value: "emotional, heartwarming or tearjerker" },
  { label: "⚔️ Epic action",         value: "intense battles and high stakes action" },
  { label: "💞 Wholesome romance",   value: "sweet romance and heartfelt connections" },
  { label: "😰 Keep me on edge",     value: "suspense, mystery and psychological tension" },
  { label: "🌸 Chill & cozy",        value: "relaxing, peaceful slice-of-life vibes" },
  { label: "🚀 Adventurous journey", value: "grand adventure and world exploration" },
];

export default function TasteQuizModal({ initialPrefs, onSubmit, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState<string[]>(initialPrefs?.genres ?? []);
  const [mood, setMood] = useState(initialPrefs?.mood ?? "");
  const [favoriteAnimes, setFavoriteAnimes] = useState<string[]>(
    initialPrefs?.favoriteAnimes ?? ["", "", ""]
  );
  const [animeInput, setAnimeInput] = useState(["", "", ""]);
  const [suggestions, setSuggestions] = useState<{ idx: number; list: string[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState<number | null>(null);

  const toggleGenre = (g: string) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const searchJikan = async (query: string, idx: number) => {
    if (!query.trim()) return;
    setSearchLoading(idx);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5&sfw=true`);
      const json = await res.json();
      const titles = (json.data ?? []).map((a: { title: string }) => a.title);
      setSuggestions({ idx, list: titles });
    } catch {
      // ignore
    } finally {
      setSearchLoading(null);
    }
  };

  const pickSuggestion = (title: string, idx: number) => {
    const updated = [...favoriteAnimes];
    updated[idx] = title;
    setFavoriteAnimes(updated);
    const inp = [...animeInput];
    inp[idx] = title;
    setAnimeInput(inp);
    setSuggestions(null);
  };

  const handleSubmit = () => {
    const cleaned = favoriteAnimes.filter(Boolean);
    onSubmit({ genres, mood, favoriteAnimes: cleaned });
  };

  const canNext = [
    genres.length > 0,        // step 0: at least 1 genre
    mood !== "",               // step 1: mood picked
    true,                      // step 2: favorites optional
  ];

  const steps = [
    { title: "What genres do you love?", subtitle: "Pick as many as you like" },
    { title: "What's your vibe right now?", subtitle: "Choose the feeling you want" },
    { title: "Anime you've already loved", subtitle: "Name up to 3 favourites (optional)" },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold">AI Taste Quiz</span>
            <span className="text-white/30 text-sm">{step + 1}/3</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5 shrink-0">
          <motion.div
            className="h-1 bg-gradient-to-r from-purple-500 to-red-500"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-white font-bold text-lg mb-1">{steps[step].title}</h2>
          <p className="text-white/40 text-sm mb-5">{steps[step].subtitle}</p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="genres"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((g) => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                      genres.includes(g)
                        ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}>
                    {g}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="mood"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button key={m.value} type="button" onClick={() => setMood(m.value)}
                    className={`px-4 py-3 rounded-xl text-left text-sm font-medium border transition-all duration-150 ${
                      mood === m.value
                        ? "bg-gradient-to-r from-purple-900/60 to-red-900/40 text-white border-purple-500/60 shadow-lg"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}>
                    {m.label}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="favorites"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="relative">
                    <label className="text-white/50 text-xs mb-1.5 block">Favourite #{idx + 1}</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder={`e.g. ${["Naruto", "Attack on Titan", "Death Note"][idx]}`}
                        value={animeInput[idx]}
                        onChange={(e) => {
                          const inp = [...animeInput];
                          inp[idx] = e.target.value;
                          setAnimeInput(inp);
                          const fav = [...favoriteAnimes];
                          fav[idx] = e.target.value;
                          setFavoriteAnimes(fav);
                          setSuggestions(null);
                        }}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-white placeholder-white/25 outline-none text-sm transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => searchJikan(animeInput[idx], idx)}
                        disabled={!animeInput[idx].trim() || searchLoading === idx}
                        className="absolute right-2 text-white/40 hover:text-purple-400 transition-colors disabled:opacity-30"
                      >
                        {searchLoading === idx
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Search className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Suggestions dropdown */}
                    {suggestions?.idx === idx && suggestions.list.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-[#1a2235] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                        {suggestions.list.map((title) => (
                          <button key={title} type="button"
                            onClick={() => pickSuggestion(title, idx)}
                            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-purple-500/20 hover:text-white transition-colors border-b border-white/5 last:border-0">
                            {title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-white/25 text-xs">💡 Type an anime name and click 🔍 to search</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-white/10 shrink-0">
          <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm disabled:opacity-25 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 2 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext[step]}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-purple-500/30">
              <Sparkles className="w-4 h-4" /> Get My Recommendations
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
