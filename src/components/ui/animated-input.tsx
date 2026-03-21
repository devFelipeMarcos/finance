"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-background px-4 py-2 text-sm transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF7F]/50 focus-visible:border-[#00FF7F]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-10",
            error && "border-destructive focus-visible:ring-destructive/50 focus-visible:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-destructive text-xs mt-1.5 pl-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

type PasswordInputProps = Omit<InputProps, "type">;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={className}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
        {error && (
          <p className="text-destructive text-xs mt-1.5 pl-1">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };
