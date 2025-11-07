import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Lovable update start - Bybit-style buttons with light mode optimization
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA - Sunset Orange
        default: "bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--accent)/0.5)] active:scale-95 font-bold",
        
        // Alternative primary - Gold gradient  
        primary: "bg-gradient-to-r from-sedimentary-base to-sedimentary-mid text-accent-foreground hover:from-sedimentary-mid hover:to-sedimentary-dark hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--sedimentary-base)/0.3)] active:scale-95 border border-sedimentary-dark/20 font-bold",
        
        // Success
        success: "bg-success text-success-foreground hover:bg-success/90 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--success)/0.4)] active:scale-95 font-bold",
        
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--destructive)/0.4)] active:scale-95 font-bold",
        
        // Outline
        outline: "border-2 border-border bg-background hover:bg-accent/10 hover:border-accent hover:text-accent hover:scale-105 hover:shadow-[0_0_15px_hsl(var(--accent)/0.2)] active:scale-95 font-semibold",
        
        // Secondary
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:border-accent/50 hover:scale-105 hover:shadow-[0_0_15px_hsl(var(--accent)/0.15)] active:scale-95 font-semibold",
        
        // Ghost
        ghost: "hover:bg-accent/10 hover:text-accent hover:scale-105 active:scale-95",
        
        // Link
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-hover",
        
        // Urban
        urban: "bg-gradient-to-br from-card to-muted border border-accent/20 hover:border-accent/60 hover:scale-105 hover:shadow-[0_0_25px_hsl(var(--accent)/0.3)] active:scale-95 backdrop-blur-sm font-semibold",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
// Lovable update end

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
