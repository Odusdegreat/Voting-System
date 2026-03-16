import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  is_loading?: boolean;
  variant?: ButtonVariant;
};

const button_variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-slate-950 hover:bg-slate-100 shadow-[0_12px_30px_rgba(255,255,255,0.12)]",
  secondary: "bg-white/10 text-white border border-white/15 hover:bg-white/15",
  ghost: "bg-transparent text-white hover:bg-white/10 border border-white/10",
  danger:
    "bg-rose-500 text-white hover:bg-rose-400 shadow-[0_12px_30px_rgba(244,63,94,0.22)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      is_loading,
      variant = "primary",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || is_loading}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          button_variants[variant],
          className,
        )}
        {...props}
      >
        {is_loading ? "Please wait..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
