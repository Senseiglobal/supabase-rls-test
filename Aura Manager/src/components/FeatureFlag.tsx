// Feature Flag Component
import React from "react";

export default function FeatureFlag({ flag, children }: { flag: boolean; children: React.ReactNode }) {
  if (!flag) return null;
  return <>{children}</>;
}
