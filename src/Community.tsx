import { Link } from "react-router-dom";
import { useEffect } from "react";
import { showSuccessToast, showErrorToast } from "./lib/toast";

export default function Community() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1f2937] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-emerald-400 bg-clip-text text-transparent mb-4">
            AnimeFinder Community
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Connect with fellow anime enthusiasts, share your favorite shows, and discover new recommendations from the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Community Discussions Card */}
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 backdrop-blur-sm border border-red-700/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:border-red-500/50">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Discussions</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Join lively discussions about your favorite anime, share theories, and get recommendations from fellow fans.
              </p>
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:border-emerald-500/50">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-3">Members</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Connect with anime fans worldwide, see who's online, and build your anime community network.
              </p>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:border-purple-500/50">
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-white mb-3">Recommendations</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Discover hidden gems and get personalized anime recommendations from the community.
              </p>
            </div>
          </div>

          {/* Events Card */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:border-blue-500/50">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-3">Events</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Participate in watch parties, anime trivia nights, and community events.
              </p>
            </div>
          </div>



          {/* Coming Soon Card */}
          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:border-gray-500/50">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">More Features</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Stay tuned for more exciting community features coming soon!
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 