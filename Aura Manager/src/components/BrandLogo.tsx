import React from "react";
import clsx from "clsx";

/**
 * BrandLogo
 * Renders the Aura Manager logo with automatic dark/light mode adaptation.
 * Uses tailwind's dark class to swap SVG fills. Accepts size & optional text lockup.
 */
interface BrandLogoProps {
  size?: number; // height in px
  showText?: boolean; // whether to show wordmark lockup
  className?: string;
  "aria-label"?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 40, showText = false, className, ...rest }) => {
  const dimension = size;
  return (
    <div
      className={clsx("flex items-center gap-2 select-none", className)}
      style={{ height: dimension }}
      {...rest}
    >
      {/* Core glyph */}
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-300"
        role="img"
        aria-hidden={rest["aria-label"] ? undefined : true}
      >
        <defs>
          <linearGradient id="auraGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" className="dark:[stop-color:#6ee7b7] [stop-color:#6366f1]" />
            <stop offset="50%" className="dark:[stop-color:#3b82f6] [stop-color:#8b5cf6]" />
            <stop offset="100%" className="dark:[stop-color:#9333ea] [stop-color:#ec4899]" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#auraGradient)" />
        <path
          d="M20 42c2.5-8 6.5-12 12-12s9.5 4 12 12M24 28c1.5-4 4-6 8-6s6.5 2 8 6"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      </svg>
      {showText && (
        <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
          Aura Manager
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
