import React from "react";
import clsx from "clsx";

/**
 * BrandLogo
 * Renders the AuraManager logo with automatic dark/light mode adaptation.
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
      {showText && (
        <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
          AuraManager
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
