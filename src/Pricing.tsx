import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap, Shield, Star } from "lucide-react";
import axios from "axios";
import { useAuth } from "./lib/AuthContext";
import { toast } from "react-toastify";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: Razorpay is a third-party global
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME";

const premiumFeatures = [
  { icon: <Sparkles className="w-5 h-5 text-purple-400" />, label: "AI-Powered Recommendations" },
  { icon: <Star className="w-5 h-5 text-yellow-400" />, label: "Exclusive Anime Wallpapers" },
  { icon: <Zap className="w-5 h-5 text-blue-400" />, label: "Premium Themes & Dark Modes" },
  { icon: <Shield className="w-5 h-5 text-green-400" />, label: "Watchlist Sync Across Devices" },
  { icon: <Crown className="w-5 h-5 text-amber-400" />, label: "100% Ad-Free Experience" },
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "",
    description: "Get started with AnimeFinder",
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
    features: ["Everything in Monthly", "Priority support", "Early access to new features"],
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

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[number]) => {
    if (!plan.plan) return; // Free plan
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
        itemName: `AnimeFinder ${plan.name} Premium`,
        metadata: { plan: plan.plan },
      });

      const options = {
        key: data.keyId || RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "AnimeFinder",
        description: `${plan.name} Premium Membership`,
        image: "/favicon.ico",
        order_id: data.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await axios.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshUser();
            toast.success("🎉 Welcome to AnimeFinder Premium!");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: { name: user.username, email: user.email },
        theme: { color: "#ef4444" },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
      <div className="text-center mb-14">
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
          Unlock the Full AnimeFinder
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-lg max-w-xl mx-auto"
        >
          Get AI recommendations, exclusive wallpapers, premium themes, and an ad-free experience.
        </motion.p>
      </div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap justify-center gap-3 mb-14"
      >
        {premiumFeatures.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/80 text-sm"
          >
            {f.icon}
            {f.label}
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
            transition={{ delay: 0.1 * i + 0.3 }}
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
              <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">{plan.name}</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.period && <span className="text-white/40 text-sm mb-1">{plan.period}</span>}
              </div>
              <p className="text-white/50 text-sm mt-1">{plan.description}</p>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSubscribe(plan)}
              disabled={!plan.plan || loading === plan.id || (user?.isPremium && plan.plan !== "")}
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
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing…
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

      {/* Money-back note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-white/30 text-sm mt-10"
      >
        🔒 Secure payments via Razorpay · Cancel anytime · No hidden charges
      </motion.p>
    </div>
  );
}
