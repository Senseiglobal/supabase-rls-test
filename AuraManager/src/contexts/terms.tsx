import { createContext, useContext } from "react";

export type TermsTrigger = "signup" | "data_input" | "platform_connect";

export interface TermsContextValue {
  open: (trigger: TermsTrigger) => void;
  close: () => void;
}

export const TermsContext = createContext<TermsContextValue | undefined>(undefined);

export function useTerms(): TermsContextValue {
  const ctx = useContext(TermsContext);
  if (!ctx) {
    throw new Error("useTerms must be used within a TermsContext.Provider (TermsWrapper)");
  }
  return ctx;
}
