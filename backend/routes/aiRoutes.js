import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import UserPreferences from "../models/UserPreferences.js";
import User from "../models/User.js";

const router = express.Router();
const JIKAN_BASE = "https://api.jikan.moe/v4";

// Lazy Gemini initialisation (same pattern as Razorpay to avoid dotenv timing issues)
let _genAI = null;
const getGenAI = () => {
  if (!_genAI) _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
};

// ─── Helper: search Jikan for a single anime title ────────────────────────────
async function jikanSearch(title) {
  try {
    const res = await fetch(
      `${JIKAN_BASE}/anime?q=${encodeURIComponent(title)}&limit=1&sfw=true`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data?.[0];
    if (!item) return null;
    return {
      mal_id: item.mal_id,
      title: item.title,
      title_english: item.title_english ?? item.title,
      synopsis: item.synopsis ?? "",
      score: item.score ?? null,
      episodes: item.episodes ?? null,
      status: item.status ?? "",
      year: item.year ?? null,
      genres: (item.genres ?? []).map((g) => g.name),
      image: item.images?.webp?.large_image_url ?? item.images?.webp?.image_url ?? null,
      url: item.url ?? `https://myanimelist.net/anime/${item.mal_id}`,
    };
  } catch {
    return null;
  }
}

// Small delay to avoid Jikan 3 req/s limit
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── POST /api/ai/recommend ──────────────────────────────────────────────────
router.post("/recommend", isAuthenticated, async (req, res) => {
  try {
    // Premium check
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.isPremium) {
      return res.status(403).json({ message: "AI recommendations are a premium feature." });
    }

    const { genres = [], mood = "", favoriteAnimes = [] } = req.body;

    if (!genres.length && !favoriteAnimes.length) {
      return res.status(400).json({ message: "Please provide at least your favourite genres or anime." });
    }

    // Persist preferences
    await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      { userId: req.userId, favoriteGenres: genres, mood, favoriteAnimes },
      { upsert: true, new: true }
    );

    // ── Build Gemini prompt ──────────────────────────────────────────────────
    const prompt = `You are an expert anime recommendation engine. Based on the following user preferences, recommend exactly 8 anime titles.

User preferences:
- Favorite genres: ${genres.length ? genres.join(", ") : "No preference"}
- Current mood / what they want to feel: ${mood || "Not specified"}
- Anime they have already loved: ${favoriteAnimes.length ? favoriteAnimes.join(", ") : "None specified"}

Rules:
1. Return ONLY valid JSON — no markdown, no backticks, no extra text.
2. The JSON must be an array of exactly 8 objects with this shape:
   { "title": "exact MAL title", "reason": "2-sentence personalised reason why this matches their taste" }
3. "title" must be the exact English title as listed on MyAnimeList.
4. Do NOT recommend any anime the user has already mentioned.
5. Mix well-known and hidden gems.
6. Make the reasons feel warm, personal, and specific to their stated preferences.

Respond with ONLY the JSON array.`;

    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Parse Gemini JSON response (strip any accidental markdown fences)
    let geminiRecs;
    try {
      const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      geminiRecs = JSON.parse(cleaned);
      if (!Array.isArray(geminiRecs)) throw new Error("Not an array");
    } catch {
      console.error("Gemini JSON parse error. Raw:", rawText);
      return res.status(500).json({ message: "AI returned invalid response. Please try again." });
    }

    // ── Enrich with Jikan data ───────────────────────────────────────────────
    const enriched = [];
    for (const rec of geminiRecs.slice(0, 8)) {
      const jikanData = await jikanSearch(rec.title);
      await sleep(380); // respect Jikan rate limit
      enriched.push({
        title: jikanData?.title ?? rec.title,
        title_english: jikanData?.title_english ?? rec.title,
        reason: rec.reason,
        mal_id: jikanData?.mal_id ?? null,
        synopsis: jikanData?.synopsis ?? "",
        score: jikanData?.score ?? null,
        episodes: jikanData?.episodes ?? null,
        status: jikanData?.status ?? "",
        year: jikanData?.year ?? null,
        genres: jikanData?.genres ?? [],
        image: jikanData?.image ?? null,
        url: jikanData?.url ?? null,
      });
    }

    // Cache recommendations on preferences doc
    await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      { lastRecommendations: enriched, lastRecommendedAt: new Date() }
    );

    res.status(200).json({ recommendations: enriched });
  } catch (err) {
    console.error("AI recommend error:", err);
    res.status(500).json({ message: "Failed to generate recommendations.", error: err.message });
  }
});

// ─── GET /api/ai/preferences ─────────────────────────────────────────────────
router.get("/preferences", isAuthenticated, async (req, res) => {
  try {
    const prefs = await UserPreferences.findOne({ userId: req.userId });
    res.status(200).json({ preferences: prefs ?? null });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch preferences.", error: err.message });
  }
});

// ─── POST /api/ai/preferences ────────────────────────────────────────────────
router.post("/preferences", isAuthenticated, async (req, res) => {
  try {
    const { genres = [], mood = "", favoriteAnimes = [] } = req.body;
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      { userId: req.userId, favoriteGenres: genres, mood, favoriteAnimes },
      { upsert: true, new: true }
    );
    res.status(200).json({ preferences: prefs });
  } catch (err) {
    res.status(500).json({ message: "Failed to save preferences.", error: err.message });
  }
});

export default router;
