import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import TasteQuizModal from "./TasteQuizModal";

interface ChatMessage {
	id: string;
	sender: "user" | "bot";
	text: string;
	timestamp: Date;
}

export default function AiChatbot() {
	const { isAuthenticated, user } = useAuth();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputText, setInputText] = useState("");
	const [loading, setLoading] = useState(false);
	const [quizOpen, setQuizOpen] = useState(false);
	const [quizLoading, setQuizLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Initialize with welcome message
	useEffect(() => {
		if (messages.length === 0) {
			setMessages([
				{
					id: "welcome",
					sender: "bot",
					text: "Hi there! I'm Kuro, your AI Anime Guide. 🤖\n\nAsk me for anime suggestions based on your mood, or click **Start Taste Quiz** to get a full list of tailored recommendations!",
					timestamp: new Date(),
				},
			]);
		}
	}, [messages]);

	// Scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	const handleSendMessage = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!inputText.trim() || loading) return;

		const userMsg: ChatMessage = {
			id: Math.random().toString(),
			sender: "user",
			text: inputText,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMsg]);
		setInputText("");
		setLoading(true);

		try {
			// Call backend AI chat endpoint
			const { data } = await axios.post(
				"/api/ai/chat",
				{
					message: userMsg.text,
					history: messages.slice(1), // omit welcome message
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			const botMsg: ChatMessage = {
				id: Math.random().toString(),
				sender: "bot",
				text: data.reply,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, botMsg]);
		} catch (err: any) {
			const errMsg =
				err.response?.data?.message || "Failed to connect to assistant.";
			setMessages((prev) => [
				...prev,
				{
					id: Math.random().toString(),
					sender: "bot",
					text: `⚠️ Error: ${errMsg}`,
					timestamp: new Date(),
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleQuizSubmit = async (prefs: {
		genres: string[];
		mood: string;
		favoriteAnimes: string[];
	}) => {
		setQuizOpen(false);
		setQuizLoading(true);
		setIsOpen(true);

		const infoMsg: ChatMessage = {
			id: Math.random().toString(),
			sender: "bot",
			text: "Running taste quiz recommendations",
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, infoMsg]);

		try {
			await axios.post("/api/ai/recommend", prefs, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			setMessages((prev) => [
				...prev,
				{
					id: Math.random().toString(),
					sender: "bot",
					text: "🎉 Your personalized recommendations are ready! Click below to view them on your profile page.",
					timestamp: new Date(),
				},
			]);
		} catch (err: any) {
			const errMsg =
				err.response?.data?.message || "Failed to generate recommendations.";
			setMessages((prev) => [
				...prev,
				{
					id: Math.random().toString(),
					sender: "bot",
					text: `⚠️ Quiz failed: ${errMsg}`,
					timestamp: new Date(),
				},
			]);
		} finally {
			setQuizLoading(false);
		}
	};

	const handleViewRecommendations = () => {
		setIsOpen(false);
		navigate("/recommendations");
	};

	return (
		<>
			{/* Floating chatbot button */}
			<div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
				<AnimatePresence>
					{!isOpen && (
						<motion.button
							initial={{ scale: 0, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0, y: 20 }}
							onClick={() => setIsOpen(true)}
							className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/40 transition-all duration-200 group flex items-center gap-2 hover:scale-105"
						>
							<MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
							<span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-sm font-bold tracking-wide">
								Chat with Kuro
							</span>
						</motion.button>
					)}
				</AnimatePresence>

				{/* Chat Widget Panel */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: 50, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 50, scale: 0.95 }}
							className="w-[92vw] sm:w-[400px] h-[500px] bg-[#0d1117]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md"
						>
							{/* Header */}
							<div className="bg-gradient-to-r from-purple-900/40 via-red-950/20 to-black p-4 border-b border-white/10 flex items-center justify-between shrink-0">
								<div className="flex items-center gap-2.5">
									<div className="relative">
										<div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-lg">
											🤖
										</div>
										<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0d1117] rounded-full" />
									</div>
									<div>
										<h3 className="text-white font-bold text-sm leading-tight flex items-center gap-1.5">
											Kuro
											<span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30">
												AI Guide
											</span>
										</h3>
										<p className="text-white/40 text-[10px]">Always online</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Chat Body */}
							<div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 flex flex-col bg-[#0b0e14]/50">
								{messages.map((msg) => (
									<div
										key={msg.id}
										className={`flex flex-col max-w-[85%] ${
											msg.sender === "user"
												? "self-end items-end"
												: "self-start items-start"
										}`}
									>
										<div
											className={`rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line border ${
												msg.sender === "user"
													? "bg-purple-600 text-white border-purple-500 rounded-tr-none shadow-lg shadow-purple-500/10"
													: "bg-white/5 text-white/90 border-white/10 rounded-tl-none"
											}`}
										>
											{msg.text}
										</div>
										<span className="text-[9px] text-white/20 mt-1 px-1">
											{msg.timestamp.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								))}

								{/* Recommendations Link inside chat */}
								{messages.some((m) =>
									m.text.includes("personalized recommendations are ready"),
								) && (
									<button
										type="button"
										onClick={handleViewRecommendations}
										className="self-center flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 my-2"
									>
										<Sparkles className="w-3.5 h-3.5" /> View My Picks →
									</button>
								)}

								{/* Loading indicator */}
								{loading && (
									<div className="self-start flex items-center gap-3 bg-gradient-to-r from-purple-950/40 to-pink-950/20 border border-purple-500/20 rounded-2xl rounded-tl-none p-3.5 text-xs text-white/70 shadow-lg shadow-purple-500/5 max-w-[85%] animate-pulse">
										<div className="relative flex items-center justify-center shrink-0">
											{/* Outer spinning aura / glowing circle */}
											<div className="absolute w-6 h-6 rounded-full border border-purple-500/40 border-t-purple-500 border-r-pink-500 animate-spin" />
											{/* Pulsing shuriken logo */}
											<svg
												className="w-4 h-4 text-purple-400 animate-pulse"
												viewBox="0 0 96 96"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<polygon
													points="48,8 56,40 88,48 56,56 48,88 40,56 8,48 40,40"
													fill="url(#loaderGrad)"
													stroke="currentColor"
													strokeWidth="4"
													strokeLinejoin="round"
												/>
												<circle
													cx="48"
													cy="48"
													r="10"
													fill="#1f1a3a"
													stroke="currentColor"
													strokeWidth="4"
												/>
												<defs>
													<linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
														<stop offset="0%" stopColor="#a855f7" />
														<stop offset="100%" stopColor="#ec4899" />
													</linearGradient>
												</defs>
											</svg>
										</div>
										<div className="flex flex-col gap-0.5">
											<span className="font-semibold text-[10px] text-purple-300 uppercase tracking-widest">
												Channeling Anime Magic...
											</span>
											<span className="text-[11px] text-white/60">
												Kuro is searching the databases...
											</span>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>

							{/* Chat Input & Gates */}
							<div className="p-4 border-t border-white/10 shrink-0 bg-[#0d1117]">
								{!isAuthenticated ? (
									<div className="text-center py-2">
										<p className="text-white/40 text-xs mb-2">
											Please log in to chat with Kuro.
										</p>
										<button
											type="button"
											onClick={() => {
												setIsOpen(false);
												navigate("/login");
											}}
											className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-all"
										>
											Log In
										</button>
									</div>
								) : !user?.isPremium ? (
									<div className="text-center py-1">
										<div className="flex items-center justify-center gap-1 text-yellow-400 text-xs font-bold mb-1">
											<Crown className="w-3.5 h-3.5" /> Premium Feature
										</div>
										<p className="text-white/50 text-[10px] mb-2">
											Unlock Kuro AI Chatbot & customized recommendations
										</p>
										<button
											type="button"
											onClick={() => {
												setIsOpen(false);
												navigate("/pricing");
											}}
											className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/20"
										>
											<Crown className="w-3.5 h-3.5" /> Get Premium
										</button>
									</div>
								) : (
									<div className="space-y-3">
										{/* Assistant Quick Options */}
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setQuizOpen(true)}
												disabled={loading || quizLoading}
												className="flex items-center gap-1 text-[10px] font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/35 border border-purple-500/30 rounded-lg px-2.5 py-1.5 transition-all"
											>
												<Sparkles className="w-3 h-3" /> Start Taste Quiz
											</button>
											<button
												type="button"
												onClick={() => {
													setInputText(
														"Suggest a few psychological horror anime.",
													);
												}}
												className="text-[10px] font-medium bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 transition-all"
											>
												👻 Horror suggestions
											</button>
										</div>

										{/* Input form */}
										<form onSubmit={handleSendMessage} className="flex gap-2">
											<input
												type="text"
												placeholder="Ask Kuro something..."
												value={inputText}
												onChange={(e) => setInputText(e.target.value)}
												className="flex-1 bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 outline-none transition-colors"
											/>
											<button
												type="submit"
												disabled={!inputText.trim() || loading}
												className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-2.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
											>
												<Send className="w-4 h-4" />
											</button>
										</form>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Taste Quiz Modal trigger from Chatbot */}
			<AnimatePresence>
				{quizOpen && (
					<TasteQuizModal
						onSubmit={handleQuizSubmit}
						onClose={() => setQuizOpen(false)}
					/>
				)}
			</AnimatePresence>
		</>
	);
}
