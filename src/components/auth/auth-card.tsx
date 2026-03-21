"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700",
        className
      )}
    >
      <div className="bg-card border shadow-2xl rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

interface AuthHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function AuthHeader({ title, description, icon: Icon }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-2 px-6 pt-8 pb-4">
      {Icon && (
        <div className="mx-auto w-14 h-14 bg-[#00FF7F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00FF7F]/20 mb-4">
          <Icon className="w-7 h-7 text-black" />
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

interface AuthFooterProps {
  children: ReactNode;
  className?: string;
}

export function AuthFooter({ children, className }: AuthFooterProps) {
  return (
    <div className={cn("px-6 pb-8 pt-4", className)}>
      {children}
    </div>
  );
}

interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">{label || "ou"}</span>
      </div>
    </div>
  );
}

interface SocialButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "outline";
}

export function SocialButton({
  onClick,
  icon,
  label,
  variant = "outline",
}: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-3 h-11 rounded-xl font-medium transition-all duration-300",
        variant === "default" &&
          "bg-white text-gray-900 hover:bg-gray-100 shadow-md hover:shadow-lg",
        variant === "outline" &&
          "border-2 bg-background hover:bg-accent hover:-translate-y-0.5"
      )}
    >
      <div className="h-5 w-5">{icon}</div>
      {label}
    </button>
  );
}

interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}
