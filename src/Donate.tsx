import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Coffee } from "lucide-react";
import axios from "axios";
import { useAuth } from "./lib/AuthContext";
import { toast } from "react-toastify";

declare global {
  interface Window { Razorpay: any; }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME";
const presetAmounts = [49, 99, 199, 499];

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

export default function Donate() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(99);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? Number(custom) : selected ?? 0;

  const handleDonate = async () => {
    if (!user) { toast.error("Please log in to donate."); return; }
    if (!finalAmount || finalAmount < 1) { toast.error("Please enter a valid amount."); return; }
    setLoading(true);
    const ok = await loadRazorpayScript();
    if (!ok) { toast.error("Payment gateway failed to load."); setLoading(false); return; }
    try {
      const { data } = await axios.post("/api/payment/order", {
        amount: finalAmount, type: "donation",
        itemName: `Support AnimeFinder — ₹${finalAmount} donation`,
      });
      const options = {
        key: data.keyId || RAZORPAY_KEY_ID, amount: data.amount, currency: data.currency,
        name: "AnimeFinder", description: "Support the Creator ❤️", image: "/favicon.ico",
        order_id: data.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await axios.post("/api/payment/verify", { razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature });
            toast.success("💖 Thank you for your support! You're amazing.");
          } catch { toast.error("Payment verification failed."); }
        },
        prefill: { name: user.username, email: user.email }, theme: { color: "#ec4899" },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch { toast.error("Donation failed. Try again."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1a0020] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Heart animation */}
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.6, ease: "easeInOut" }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shadow-2xl shadow-pink-500/30">
            <Heart className="w-10 h-10 text-pink-400 fill-pink-400" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-1.5 text-pink-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Support the Creator
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-red-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Support AnimeFinder ❤️
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-md mx-auto">
            AnimeFinder is built with love by a solo developer. Your support helps keep the servers running,
            new features coming, and the anime community thriving. Every rupee counts! 🙏
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
          {/* Preset amounts */}
          <div>
            <p className="text-white/50 text-sm mb-3 font-medium">Choose an amount</p>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amt) => (
                <button key={amt} type="button"
                  onClick={() => { setSelected(amt); setCustom(""); }}
                  className={`py-3 rounded-xl font-bold text-sm border transition-all duration-200 ${selected === amt && !custom ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"}`}>
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-white/50 text-sm mb-2 font-medium">Or enter custom amount</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">₹</span>
              <input
                type="number" min="1" placeholder="e.g. 250"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                className="w-full bg-white/5 border border-white/10 focus:border-pink-500/50 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/30 outline-none transition-colors duration-200 text-sm"
              />
            </div>
          </div>

          {/* What your support does */}
          <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4">
            <p className="text-pink-300 text-sm font-medium mb-2 flex items-center gap-1.5"><Coffee className="w-4 h-4" /> Your support helps with:</p>
            <ul className="text-white/60 text-xs space-y-1">
              <li>☕ Coffee to fuel late-night coding sessions</li>
              <li>🖥️ Server & hosting costs to keep AnimeFinder fast</li>
              <li>🎨 New features, themes, and anime database updates</li>
              <li>🌟 Keeping the app forever free for all anime fans</li>
            </ul>
          </div>

          <button
            type="button" onClick={handleDonate} disabled={loading || !finalAmount}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base">
            {loading ? (
              <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Processing…</>
            ) : (
              <><Heart className="w-5 h-5 fill-white" /> Support with ₹{finalAmount || "…"}</>
            )}
          </button>

          <p className="text-center text-white/25 text-xs">🔒 Secure payment via Razorpay · No recurring charges</p>
        </motion.div>

        {/* Supporters note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center text-white/30 text-sm mt-6">
          Joined by <span className="text-pink-400 font-semibold">1,200+ anime fans</span> who support AnimeFinder 💖
        </motion.p>
      </div>
    </div>
  );
}
