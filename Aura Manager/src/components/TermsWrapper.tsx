import { type ReactNode } from "react";
import { TermsContext } from "@/contexts/terms";

interface TermsWrapperProps {
  children: ReactNode;
}

export const TermsWrapper = ({ children }: TermsWrapperProps) => {
  // Make Terms a no-op wrapper to fully remove any popups/tooltips
  const open = () => {};
  const close = () => {};
  return (
    <TermsContext.Provider value={{ open, close }}>
      {children}
    </TermsContext.Provider>
  );
};

// useTerms hook is provided by contexts/terms

export default TermsWrapper;