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
            "p-2 lg:px-3 lg:py-2 text-sm font-medium text-foreground/70 hover:text-accent transition-colors rounded-md hover:bg-accent/10 flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 min-w-[48px] lg:min-w-0",
            className,
            isActive && "text-accent bg-accent/10",
            isPending && pendingClassName
          )
        }
        {...props}
      >
        {({ isActive, isPending }) => (
          <>
            {Icon && <Icon className="h-5 w-5 lg:h-4 lg:w-4" />}
            {typeof children === 'function' ? children({ isActive, isPending, isTransitioning: false }) : children}
          </>
        )}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
