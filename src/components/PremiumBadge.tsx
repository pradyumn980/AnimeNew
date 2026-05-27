import { Crown } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

interface PremiumBadgeProps {
  size?: "sm" | "md";
}

export default function PremiumBadge({ size = "sm" }: PremiumBadgeProps) {
  const { user } = useAuth();
  if (!user?.isPremium) return null;

  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5 gap-0.5" : "text-sm px-2 py-1 gap-1";

  return (
    <span
      className={`inline-flex items-center ${sizeClass} rounded-full font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30`}
    >
      <Crown className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      PRO
    </span>
  );
}
