"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground hover:shadow-lg hover:-translate-y-0.5",
        secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
        ghost: "bg-transparent text-white hover:bg-white/5"
      },
      size: {
        default: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
        sm: "px-3 py-1.5 text-sm"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={clsx(buttonVariants({ variant, size }), className)} {...props} />;
}

