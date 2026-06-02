import axios from "axios";
import { motion } from "framer-motion";
import {
	Check,
	Crown,
	Loader2,
	Play,
	Shield,
	Sparkles,
	Star,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./lib/AuthContext";

declare global {
	interface Window {
		Razorpay: any;
	}
}

const RAZORPAY_KEY_ID =
	import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME";
const JIKAN_BASE = "https://api.jikan.moe/v4";

interface JikanAnime {
	mal_id: number;
	title: string;
	images: { webp: { image_url: string; large_image_url: string } };
	score: number;
	genres: { name: string }[];
}

const premiumFeatures = [
	{
		icon: <Sparkles className="w-5 h-5 text-purple-400" />,
		label: "AI-Powered Recommendations",
	},
	{
		icon: <Star className="w-5 h-5 text-yellow-400" />,
		label: "Exclusive Anime Wallpapers",
	},
	{
		icon: <Zap className="w-5 h-5 text-blue-400" />,
		label: "Premium Themes & Dark Modes",
	},
	{
		icon: <Shield className="w-5 h-5 text-green-400" />,
		label: "Watchlist Sync Across Devices",
	},
	{
		icon: <Crown className="w-5 h-5 text-amber-400" />,
		label: "100% Ad-Free Experience",
	},
];

const plans = [
	{
		id: "free",
		name: "Free",
		price: 0,
		period: "",
		description: "Get started with AniVerse",
		features: ["Browse anime catalog", "Basic search", "Community access"],
		cta: "Current Plan",
		highlight: false,
		plan: "",
	},
	{
		id: "monthly",
		name: "Monthly",
		price: 99,
		period: "/month",
		description: "All premium features, cancel anytime",
		features: ["Everything in Free", ...premiumFeatures.map((f) => f.label)],
		cta: "Subscribe Monthly",
		highlight: false,
		plan: "monthly",
	},
	{
		id: "annual",
		name: "Annual",
		price: 799,
		period: "/year",
		badge: "BEST VALUE — Save ₹389",
		description: "Best deal — 2 months free!",
		features: [
			"Everything in Monthly",
			"Priority support",
			"Early access to new features",
		],
		cta: "Subscribe Annually",
		highlight: true,
		plan: "annual",
	},
];

function loadRazorpayScript(): Promise<boolean> {
	return new Promise((resolve) => {
		if (document.getElementById("razorpay-script")) return resolve(true);
		const script = document.createElement("script");
		script.id = "razorpay-script";
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

// Live anime showcase strip fetched from Jikan
function AnimeShowcase({
	animes,
	loading,
}: { animes: JikanAnime[]; loading: boolean }) {
	if (loading) {
		return (
			<div className="flex justify-center gap-3 overflow-x-auto pb-2 mb-14 scrollbar-hide">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="shrink-0 w-28 h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse"
					/>
				))}
			</div>
		);
	}
	if (!animes.length) return null;
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			className="mb-14"
		>
			<p className="text-center text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">
				🔓 Unlock premium content from these & more
			</p>
			<div className="flex gap-3 overflow-x-auto pb-3 justify-start md:justify-center scrollbar-hide">
				{animes.map((anime, i) => (
					<motion.div
						key={anime.mal_id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: i * 0.05 + 0.35 }}
						className="group shrink-0 relative w-28 h-40 rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer shadow-lg"
					>
						<img
							src={
								anime.images.webp.large_image_url || anime.images.webp.image_url
							}
							alt={anime.title}
							className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
							loading="lazy"
						/>
						{/* Overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
							<p className="text-white text-[10px] font-semibold line-clamp-2 leading-tight">
								{anime.title}
							</p>
							{anime.score > 0 && (
								<span className="flex items-center gap-0.5 text-yellow-400 text-[10px] mt-0.5">
									<Star className="w-2.5 h-2.5 fill-yellow-400" /> {anime.score}
								</span>
							)}
						</div>
						{/* Premium lock icon */}
						<div className="absolute top-1.5 right-1.5 bg-yellow-400/90 rounded-full p-0.5">
							<Crown className="w-2.5 h-2.5 text-black" />
						</div>
					</motion.div>
				))}
				{/* "And more" card */}
				<div className="shrink-0 w-28 h-40 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-1 text-white/40">
					<Play className="w-6 h-6" />
					<span className="text-xs font-medium text-center px-2">
						500+
						<br />
						more
					</span>
				</div>
			</div>
		</motion.div>
	);
}

export default function Pricing() {
	const { user, refreshUser } = useAuth();
	const [loading, setLoading] = useState<string | null>(null);
	const [showcaseAnimes, setShowcaseAnimes] = useState<JikanAnime[]>([]);
	const [showcaseLoading, setShowcaseLoading] = useState(true);

	// Fetch top currently-airing anime from Jikan for the showcase strip
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(
					`${JIKAN_BASE}/top/anime?filter=airing&limit=12&page=1`,
				);
				if (!res.ok) return;
				const json = await res.json();
				if (!cancelled) setShowcaseAnimes(json.data ?? []);
			} catch {
				// silently ignore
			} finally {
				if (!cancelled) setShowcaseLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const handleSubscribe = async (plan: (typeof plans)[number]) => {
		if (!plan.plan) return;
		if (!user) {
			toast.error("Please log in to subscribe.");
			return;
		}

		setLoading(plan.id);
		const scriptLoaded = await loadRazorpayScript();
		if (!scriptLoaded) {
			toast.error("Failed to load payment gateway. Please try again.");
			setLoading(null);
			return;
		}

		try {
			const { data } = await axios.post("/api/payment/order", {
				amount: plan.price,
				type: "membership",
				itemName: `AniVerse ${plan.name} Premium`,
				metadata: { plan: plan.plan },
			});

			const options = {
				key: data.keyId || RAZORPAY_KEY_ID,
				amount: data.amount,
				currency: data.currency,
				name: "AniVerse",
				description: `${plan.name} Premium Membership`,
				image: "/favicon.ico",
				order_id: data.orderId,
				handler: async (response: {
					razorpay_order_id: string;
					razorpay_payment_id: string;
					razorpay_signature: string;
				}) => {
					try {
						await axios.post("/api/payment/verify", {
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
						});
						await refreshUser();
						toast.success("🎉 Welcome to AniVerse Premium!");
					} catch {
						toast.error("Payment verification failed. Contact support.");
					}
				},
				prefill: { name: user.username, email: user.email },
				theme: { color: "#ef4444" },
				modal: { ondismiss: () => setLoading(null) },
			};

			new window.Razorpay(options).open();
		} catch (err) {
			console.error(err);
			toast.error("Failed to initiate payment. Try again.");
		} finally {
			setLoading(null);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1a0a2e] px-4 py-12">
			{/* Header */}
			<div className="text-center mb-10">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-medium mb-4"
				>
					<Crown className="w-4 h-4" /> Premium Membership
				</motion.div>
				<motion.h1
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-3"
				>
					Unlock the Full AniVerse
				</motion.h1>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-white/60 text-lg max-w-xl mx-auto"
				>
					AI recommendations, exclusive wallpapers, premium themes, watchlist
					sync & ad-free experience.
				</motion.p>
			</div>

			{/* Live anime showcase strip */}
			<AnimeShowcase animes={showcaseAnimes} loading={showcaseLoading} />

			{/* Feature pills */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.45 }}
				className="flex flex-wrap justify-center gap-3 mb-14"
			>
				{premiumFeatures.map((f) => (
					<div
						key={f.label}
						className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/80 text-sm hover:bg-white/10 transition-colors"
					>
						{f.icon} {f.label}
					</div>
				))}
			</motion.div>

			{/* Pricing cards */}
			<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
				{plans.map((plan, i) => (
					<motion.div
						key={plan.id}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 * i + 0.5 }}
						className={`relative rounded-2xl p-6 flex flex-col gap-5 border transition-all duration-300 ${
							plan.highlight
								? "bg-gradient-to-b from-purple-900/60 to-black border-purple-500/60 shadow-2xl shadow-purple-500/20 scale-105"
								: "bg-white/5 border-white/10 hover:border-white/20"
						}`}
					>
						{plan.badge && (
							<span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
								{plan.badge}
							</span>
						)}
						<div>
							<p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">
								{plan.name}
							</p>
							<div className="flex items-end gap-1">
								<span className="text-4xl font-extrabold text-white">
									{plan.price === 0 ? "Free" : `₹${plan.price}`}
								</span>
								{plan.period && (
									<span className="text-white/40 text-sm mb-1">
										{plan.period}
									</span>
								)}
							</div>
							<p className="text-white/50 text-sm mt-1">{plan.description}</p>
						</div>
						<ul className="flex flex-col gap-2.5 flex-1">
							{plan.features.map((feature) => (
								<li
									key={feature}
									className="flex items-start gap-2 text-white/80 text-sm"
								>
									<Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />{" "}
									{feature}
								</li>
							))}
						</ul>
						<button
							type="button"
							onClick={() => handleSubscribe(plan)}
							disabled={
								!plan.plan ||
								loading === plan.id ||
								(user?.isPremium && plan.plan !== "")
							}
							className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
								plan.highlight
									? "bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white shadow-lg hover:shadow-purple-500/30"
									: plan.plan
										? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
										: "bg-white/5 text-white/40 cursor-default"
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							{loading === plan.id ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" /> Processing…
								</span>
							) : user?.isPremium && plan.plan ? (
								"✓ Active Plan"
							) : (
								plan.cta
							)}
						</button>
					</motion.div>
				))}
			</div>

			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.9 }}
				className="text-center text-white/30 text-sm mt-10"
			>
				🔒 Secure payments via Razorpay · Cancel anytime · No hidden charges
			</motion.p>
		</div>
	);
}
