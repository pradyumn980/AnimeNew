import React from "react";

export default function Loader({ fullscreen = false }: { fullscreen?: boolean }) {
  const loaderContent = (
    <div className="flex justify-center items-center w-full h-full">
      <svg
        className="animate-spin-slow"
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#shadow)">
          <polygon
            points="48,8 56,40 88,48 56,56 48,88 40,56 8,48 40,40"
            fill="#3b82f6"
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="48" cy="48" r="8" fill="#f59e42" stroke="#1e293b" strokeWidth="4" />
        </g>
        <defs>
          <filter id="shadow" x="0" y="0" width="96" height="96" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.2" />
          </filter>
        </defs>
      </svg>
      <style>{`
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/40">
        {loaderContent}
      </div>
    );
  }
  return loaderContent;
} 