import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  icon?: LucideIcon;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, icon: Icon, to, children, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            // 1. Core Flex alignment - items-center for proper vertical centering
            "flex items-center",
            // 2. Consistent gap between icon and text
            "gap-x-3",
            // 3. Padding for adequate touch target (py-3 px-4 for better mobile)
            "py-3 px-4",
            // 4. Text styling - ensure visibility
            "text-sm font-medium",
            // 5. Prevent text from wrapping awkwardly
            "whitespace-nowrap",
            // 6. Responsive adjustments
            "lg:flex-row lg:gap-x-3",
            // 7. Base state colors
            "text-foreground/70 hover:text-accent transition-all duration-200 rounded-md hover:bg-accent/10",
            // 8. Active state styling with background and text color
            isActive && "bg-accent/20 text-accent font-semibold",
            // 9. Pending state
            isPending && pendingClassName,
            // 10. Custom className override
            className
          )
        }
        {...props}
      >
        {({ isActive, isPending }) => (
          <>
            {Icon && (
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-accent" : "text-foreground/60"
              )} />
            )}
            <span className="text-left flex-1 font-medium break-words leading-tight">
              {typeof children === 'function' ? children({ isActive, isPending, isTransitioning: false }) : children}
            </span>
          </>
        )}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
