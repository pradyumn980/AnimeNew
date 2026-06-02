import { Mail, MessageCircle, Twitter } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
	return (
		<footer className="bg-black/85 border-t border-red-700/30 py-12 mt-8">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
					{/* Website Name and Description */}
					<div className="space-y-4">
						<h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-emerald-400 bg-clip-text text-transparent">
							AniVerse
						</h3>
						<p className="text-gray-400 text-base leading-relaxed">
							Discover, explore, and connect with the anime community. Find your
							next favorite anime, read reviews, and join discussions with
							fellow enthusiasts.
						</p>
					</div>

					{/* Navigation Links */}
					<div className="space-y-4">
						<h4 className="text-white font-semibold text-xl">Quick Links</h4>
						<div className="grid grid-cols-2 gap-3 text-base">
							<Link
								to="/"
								className="block text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
							>
								Home
							</Link>
							<Link
								to="/search"
								className="block text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
							>
								Search Anime
							</Link>
							<Link
								to="/community"
								className="block text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
							>
								Community
							</Link>
							<Link
								to="/shop"
								className="block text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
							>
								Shop
							</Link>
							<Link
								to="/donate"
								className="block text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
							>
								Donate
							</Link>
							<Link
								to="/pricing"
								className="block text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
							>
								Premium
							</Link>
						</div>
					</div>

					{/* Contact Information */}
					<div className="space-y-4">
						<h4 className="text-white font-semibold text-xl">Contact Us</h4>
						<div className="space-y-3 text-base">
							<div className="flex items-center gap-2 text-gray-400">
								<Mail className="w-4 h-4" />
								<a
									href="mailto:support@aniverse.com"
									className="text-emerald-400 hover:underline"
								>
									support@aniverse.com
								</a>
							</div>
							<div className="flex items-center gap-2 text-gray-400">
								<Twitter className="w-4 h-4 text-sky-400" />
								<a
									href="https://twitter.com/yourhandle"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sky-400 hover:underline"
								>
									@yourhandle
								</a>
							</div>
							<div className="flex items-center gap-2 text-gray-400">
								<MessageCircle className="w-4 h-4 text-indigo-400" />
								<a
									href="https://discord.gg/yourdiscord"
									target="_blank"
									rel="noopener noreferrer"
									className="text-indigo-400 hover:underline"
								>
									Join our Discord
								</a>
							</div>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-700/50 mt-10 pt-8">
					<div className="text-center text-gray-500 text-sm">
						&copy; {new Date().getFullYear()} AniVerse. All rights reserved.
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

