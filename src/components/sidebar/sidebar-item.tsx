"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
  badgeVariant?: "default" | "danger";
  isCollapsed?: boolean;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  badge,
  badgeVariant = "default",
  isCollapsed,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/app/${href}` || pathname.startsWith(`/app/${href}/`);

  const itemContent = (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg transition-all duration-200 py-3",
        isActive
          ? "bg-[#00FF7F]/15 text-[#00FF7F] shadow-[0_0_15px_-3px_rgba(0,255,127,0.3)]"
          : "text-muted-foreground hover:bg-[#00FF7F]/10 hover:text-[#00FF7F]",
        isCollapsed ? "justify-center px-2" : "px-3"
      )}
      data-state={isActive ? "active" : "inactive"}
    >
      <div className="relative flex-shrink-0">
        <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
        {badge !== undefined && badge > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shadow-lg",
              badgeVariant === "danger"
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[#00FF7F] text-black"
            )}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium transition-all duration-200">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                badgeVariant === "danger"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-[#00FF7F]/20 text-[#00FF7F]"
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00FF7F] rounded-r-full shadow-[0_0_10px_rgba(0,255,127,0.5)]" />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{itemContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className={cn(
              "flex items-center gap-2 bg-zinc-900 border-zinc-700 text-white",
              badge !== undefined && badge > 0 && "pr-3"
            )}
          >
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  badgeVariant === "danger"
                    ? "bg-red-500 text-white"
                    : "bg-[#00FF7F] text-black"
                )}
              >
                {badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return itemContent;
}

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CollapseButton({ isCollapsed, onToggle }: CollapseButtonProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              "hover:bg-white/10 text-muted-foreground hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#00FF7F]/50"
            )}
            style={{ width: 32, height: 32 }}
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-zinc-900 border-zinc-700 text-white">
          {isCollapsed ? "Expandir" : "Recolher"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
