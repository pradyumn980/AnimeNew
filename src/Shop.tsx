import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Package, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "./lib/AuthContext";
import { toast } from "react-toastify";

declare global {
  interface Window { Razorpay: any; }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME";
const JIKAN_BASE = "https://api.jikan.moe/v4";

// Each product maps to a specific MAL anime ID for artwork
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  jikanId: number;   // MAL ID used to fetch real poster from Jikan
  animeTitle: string; // anime the art comes from
  description: string;
  tag?: string;
  image?: string;    // populated at runtime from Jikan
}

interface CartItem extends Product { qty: number; }

const PRODUCT_DEFS: Omit<Product, "image">[] = [
  // Posters
  { id: "poster-1", name: "Attack on Titan Poster",   price: 299,  category: "Posters",   jikanId: 16498, animeTitle: "Shingeki no Kyojin",       description: "High-quality A2 glossy print, fade-resistant ink." },
  { id: "poster-2", name: "Demon Slayer Poster",       price: 299,  category: "Posters",   jikanId: 38000, animeTitle: "Kimetsu no Yaiba",          description: "Vibrant art print perfect for any anime room.", tag: "Popular" },
  { id: "poster-3", name: "One Piece Wanted Poster",   price: 249,  category: "Posters",   jikanId: 21,    animeTitle: "One Piece",                 description: "Classic wanted-poster style, frame-ready." },
  // Hoodies
  { id: "hoodie-1", name: "Naruto Hokage Hoodie",      price: 899,  category: "Hoodies",   jikanId: 20,    animeTitle: "Naruto",                    description: "350 GSM fleece, embroidered logo, unisex fit." },
  { id: "hoodie-2", name: "Death Note Hoodie",         price: 899,  category: "Hoodies",   jikanId: 1535,  animeTitle: "Death Note",                description: "Minimal design, double-stitched hems, ultra-soft.", tag: "Best Seller" },
  { id: "hoodie-3", name: "My Hero Academia Hoodie",   price: 949,  category: "Hoodies",   jikanId: 31964, animeTitle: "Boku no Hero Academia",      description: "Full-color print, kangaroo pocket, Plus Ultra!" },
  // Figurines
  { id: "fig-1",    name: "Goku Super Saiyan Figure",  price: 1499, category: "Figurines", jikanId: 813,   animeTitle: "Dragon Ball Z",             description: "18 cm PVC, hand-painted, display base included.", tag: "Limited" },
  { id: "fig-2",    name: "Levi Ackerman Figure",      price: 1699, category: "Figurines", jikanId: 16498, animeTitle: "Shingeki no Kyojin",        description: "20 cm poseable figure, interchangeable blades." },
  { id: "fig-3",    name: "Zero Two Figure",           price: 1599, category: "Figurines", jikanId: 35849, animeTitle: "Darling in the FranXX",     description: "Collector's edition, 22 cm, acrylic stand." },
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

// Jikan rate-limits to 3 req/s — fetch sequentially with small delay
async function fetchJikanImages(ids: number[]): Promise<Record<number, string>> {
  const map: Record<number, string> = {};
  const unique = [...new Set(ids)];
  for (const id of unique) {
    try {
      const res = await fetch(`${JIKAN_BASE}/anime/${id}`);
      if (!res.ok) continue;
      const json = await res.json();
      const img: string =
        json.data?.images?.webp?.large_image_url ||
        json.data?.images?.webp?.image_url ||
        json.data?.images?.jpg?.large_image_url ||
        "";
      if (img) map[id] = img;
    } catch {
      // silently skip failed fetches
    }
    await new Promise((r) => setTimeout(r, 380)); // ~2.6 req/s stays under limit
  }
  return map;
}

const categories = ["All", "Posters", "Hoodies", "Figurines"];

export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(PRODUCT_DEFS.map((p) => ({ ...p, image: undefined })));
  const [imagesLoading, setImagesLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [payLoading, setPayLoading] = useState(false);

  // Fetch real anime artwork from Jikan on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setImagesLoading(true);
      const ids = PRODUCT_DEFS.map((p) => p.jikanId);
      const imageMap = await fetchJikanImages(ids);
      if (!cancelled) {
        setProducts(
          PRODUCT_DEFS.map((p) => ({
            ...p,
            image: imageMap[p.jikanId] ?? undefined,
          }))
        );
        setImagesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`🛒 ${product.name} added!`);
  };

  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleCheckout = async () => {
    if (!user) { toast.error("Please log in to checkout."); return; }
    if (!cart.length) return;
    setPayLoading(true);
    const ok = await loadRazorpayScript();
    if (!ok) { toast.error("Payment gateway failed to load."); setPayLoading(false); return; }
    try {
      const { data } = await axios.post("/api/payment/order", {
        amount: cartTotal,
        type: "merchandise",
        itemName: cart.map((i) => `${i.name} x${i.qty}`).join(", "),
        metadata: { items: cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })) },
      });
      const options = {
        key: data.keyId || RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "AnimeFinder Shop",
        description: `${cartCount} item(s)`,
        image: "/favicon.ico",
        order_id: data.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await axios.post("/api/payment/verify", {
              razorpay_order_id: r.razorpay_order_id,
              razorpay_payment_id: r.razorpay_payment_id,
              razorpay_signature: r.razorpay_signature,
            });
            setCart([]); setCartOpen(false);
            toast.success("🎉 Order placed! We'll ship it soon.");
          } catch { toast.error("Payment verification failed."); }
        },
        prefill: { name: user.username, email: user.email },
        theme: { color: "#ef4444" },
        modal: { ondismiss: () => setPayLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch { toast.error("Checkout failed. Try again."); } finally { setPayLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1a0010] px-4 py-12">
      {/* Header */}
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
        {imagesLoading && (
          <p className="text-white/30 text-sm mt-2 flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching anime artwork…
          </p>
        )}
      </div>

      {/* Category filter */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${activeCategory === cat ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product, i) => (
          <motion.div key={product.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-red-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-red-500/10">

            {/* Poster image from Jikan */}
            <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.animeTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Anime title chip */}
              <div className="absolute bottom-2 left-3 right-3">
                <span className="text-white/80 text-xs font-medium bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {product.animeTitle}
                </span>
              </div>
              {/* Category badge */}
              <div className="absolute top-2 left-3">
                <span className="text-xs font-bold text-white/70 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              {/* Tag badge */}
              {product.tag && (
                <div className="absolute top-2 right-3">
                  <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/40">
                    {product.tag}
                  </span>
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="p-4 flex flex-col gap-3 flex-1">
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">{product.name}</h3>
                <p className="text-white/40 text-xs mt-1">{product.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-white font-bold text-xl">₹{product.price}</span>
                <button type="button" onClick={() => addToCart(product)}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} type="button" onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full py-3 px-5 shadow-2xl shadow-red-500/40 flex items-center gap-2 font-bold z-40 transition-all duration-200">
          <ShoppingCart className="w-5 h-5" /><span>{cartCount} item{cartCount > 1 ? "s" : ""}</span>
          <span className="hidden sm:inline font-normal text-white/80">· ₹{cartTotal}</span>
        </motion.button>
      )}

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0d1117] border-l border-white/10 z-50 flex flex-col">
              {/* Cart header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-red-400" /> Cart ({cartCount})
                </h2>
                <button type="button" onClick={() => setCartOpen(false)} className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    {item.image ? (
                      <img src={item.image} alt={item.animeTitle} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-2xl">🎴</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-white/40 text-xs">{item.category} · ₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-red-500/30 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white text-sm w-5 text-center font-medium">{item.qty}</span>
                      <button type="button" onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-red-500/30 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout footer */}
              <div className="p-5 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-white">
                  <span className="text-white/60">Subtotal ({cartCount} items)</span>
                  <span className="font-bold text-xl">₹{cartTotal}</span>
                </div>
                <button type="button" onClick={handleCheckout} disabled={payLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                  {payLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : `Pay ₹${cartTotal} →`}
                </button>
                <p className="text-center text-white/25 text-xs">🔒 Secured by Razorpay</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
