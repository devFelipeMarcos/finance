"use client";

import {
  ChartBarStacked,
  CircleGauge,
  ArrowLeftRight,
  ClipboardMinus,
  Info,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavUser } from "./components/nav-user";
import { SidebarItem, CollapseButton } from "./sidebar-item";
import { usePendingCount } from "@/hooks/use-pending-count";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { count: pendingCount } = usePendingCount();
  const isCollapsed = state === "collapsed";

  const mainNavItems = [
    { title: "Dashboard", url: "dashboard", icon: CircleGauge },
    { title: "Carteira", url: "wallet", icon: Wallet },
    { title: "Transações", url: "transactions", icon: ArrowLeftRight },
    { title: "Categorias", url: "categories", icon: ChartBarStacked },
    {
      title: "Pendências",
      url: "pending",
      icon: Info,
      badge: pendingCount,
      badgeVariant: "danger" as const,
    },
    { title: "Relatórios", url: "reports", icon: ClipboardMinus },
    { title: "Ajuda", url: "help", icon: Info },
  ];

  return (
    <Sidebar collapsible="icon" className="border-none bg-sidebar">
      <SidebarHeader className="border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00FF7F] to-[#00cc66] shadow-lg shadow-[#00FF7F]/20">
              <Wallet className="h-5 w-5 text-black" />
            </div>
            <span
              className={cn(
                "text-lg font-bold tracking-tight text-white whitespace-nowrap transition-all duration-300",
                isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
              )}
            >
              Balancefy
            </span>
          </div>
          <CollapseButton isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full flex-1 overflow-y-auto">
        <SidebarGroup className="px-2 flex-1">
          <SidebarGroupContent>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarItem
                  key={item.title}
                  icon={item.icon}
                  label={item.title}
                  href={item.url}
                  badge={item.badge}
                  badgeVariant={item.badgeVariant}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 p-2">
        <NavUser isCollapsed={isCollapsed} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
