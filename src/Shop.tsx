import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Package } from "lucide-react";
import axios from "axios";
import { useAuth } from "./lib/AuthContext";
import { toast } from "react-toastify";

declare global {
  interface Window { Razorpay: any; }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME";

interface Product { id: string; name: string; price: number; category: string; emoji: string; description: string; tag?: string; }
interface CartItem extends Product { qty: number; }

const products: Product[] = [
  { id: "poster-1", name: "Attack on Titan Poster", price: 299, category: "Posters", emoji: "🗡️", description: "High-quality A2 glossy print, fade-resistant ink." },
  { id: "poster-2", name: "Demon Slayer Poster", price: 299, category: "Posters", emoji: "🌸", description: "Vibrant art print perfect for any anime room." },
  { id: "poster-3", name: "One Piece Wanted Poster", price: 249, category: "Posters", emoji: "☠️", description: "Classic wanted-poster style, frame-ready.", tag: "Popular" },
  { id: "hoodie-1", name: "Naruto Hokage Hoodie", price: 899, category: "Hoodies", emoji: "🍃", description: "350 GSM fleece, embroidered logo, unisex fit." },
  { id: "hoodie-2", name: "Death Note Hoodie", price: 899, category: "Hoodies", emoji: "📓", description: "Minimal design, double-stitched hems, ultra-soft.", tag: "Best Seller" },
  { id: "hoodie-3", name: "My Hero Academia Hoodie", price: 949, category: "Hoodies", emoji: "💥", description: "Full-color print, kangaroo pocket, Plus Ultra!" },
  { id: "fig-1", name: "Goku Super Saiyan Figure", price: 1499, category: "Figurines", emoji: "⚡", description: "18 cm PVC, hand-painted, display base included.", tag: "Limited" },
  { id: "fig-2", name: "Levi Ackerman Figure", price: 1699, category: "Figurines", emoji: "⚔️", description: "20 cm poseable figure, interchangeable blades." },
  { id: "fig-3", name: "Zero Two Figure", price: 1599, category: "Figurines", emoji: "💞", description: "Collector's edition, 22 cm, acrylic stand." },
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

const categories = ["All", "Posters", "Hoodies", "Figurines"];

export default function Shop() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.emoji} Added to cart!`);
  };
  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleCheckout = async () => {
    if (!user) { toast.error("Please log in to checkout."); return; }
    if (!cart.length) return;
    setLoading(true);
    const ok = await loadRazorpayScript();
    if (!ok) { toast.error("Payment gateway failed to load."); setLoading(false); return; }
    try {
      const { data } = await axios.post("/api/payment/order", {
        amount: cartTotal, type: "merchandise",
        itemName: cart.map((i) => `${i.name} x${i.qty}`).join(", "),
        metadata: { items: cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })) },
      });
      const options = {
        key: data.keyId || RAZORPAY_KEY_ID, amount: data.amount, currency: data.currency,
        name: "AnimeFinder Shop", description: `${cartCount} item(s)`, image: "/favicon.ico",
        order_id: data.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await axios.post("/api/payment/verify", { razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature });
            setCart([]); setCartOpen(false);
            toast.success("🎉 Order placed! We'll ship it soon.");
          } catch { toast.error("Payment verification failed."); }
        },
        prefill: { name: user.username, email: user.email }, theme: { color: "#ef4444" },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch { toast.error("Checkout failed. Try again."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1a0010] px-4 py-12">
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-red-400 text-sm font-medium mb-4">
          <Package className="w-4 h-4" /> Official Merch Store
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-3">
          Anime Merchandise 👕
        </motion.h1>
        <p className="text-white/50 text-lg">Posters · Hoodies · Figurines — delivered to your door.</p>
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${activeCategory === cat ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-red-500/40 transition-all duration-300 group">
            <div className="w-full h-40 rounded-xl bg-gradient-to-br from-red-900/30 to-purple-900/30 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-300">
              {product.emoji}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{product.category}</p>
                <h3 className="text-white font-semibold text-sm">{product.name}</h3>
              </div>
              {product.tag && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 font-medium shrink-0">{product.tag}</span>}
            </div>
            <p className="text-white/50 text-xs">{product.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-white font-bold text-lg">₹{product.price}</span>
              <button type="button" onClick={() => addToCart(product)}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {cartCount > 0 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} type="button" onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-2xl shadow-red-500/40 flex items-center gap-2 font-bold z-40 transition-all duration-200">
          <ShoppingCart className="w-5 h-5" /><span>{cartCount}</span>
          <span className="hidden sm:inline">· ₹{cartTotal}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f172a] border-l border-white/10 z-50 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-red-400" /> Your Cart</h2>
                <button type="button" onClick={() => setCartOpen(false)} className="text-white/50 hover:text-white p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-white/50 text-xs">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20"><Minus className="w-3 h-3" /></button>
                      <span className="text-white text-sm w-4 text-center">{item.qty}</span>
                      <button type="button" onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-white/10">
                <div className="flex justify-between text-white mb-4">
                  <span className="text-white/60">Total</span>
                  <span className="font-bold text-lg">₹{cartTotal}</span>
                </div>
                <button type="button" onClick={handleCheckout} disabled={loading}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/30 disabled:opacity-50">
                  {loading ? "Processing…" : `Pay ₹${cartTotal} →`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
