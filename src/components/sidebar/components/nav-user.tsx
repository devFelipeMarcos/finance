"use client";

import { EllipsisVertical, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { EditProfile } from "@/components/sidebar/components/edit-profile";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { DrawerConfig } from "./drawer-config";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type User = {
  name: string;
  email: string;
  image?: string;
};

interface NavUserProps {
  isCollapsed?: boolean;
}

export function NavUser({ isCollapsed }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });
    }
  }, [status, session]);

  const userButton = (
    <SidebarMenuButton
      size="lg"
      className={cn(
        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200",
        isCollapsed ? "justify-center p-0 h-10 w-10" : "px-3"
      )}
    >
      <Avatar className={cn("h-8 w-8 rounded-lg grayscale", isCollapsed && "h-9 w-9")}>
        <AvatarImage
          src={user?.image || "/avatar.png"}
          alt={user?.name ?? "User"}
        />
        <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#00FF7F]/20 to-[#00FF7F]/10 text-[#00FF7F] font-semibold">
          {user?.name?.slice(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.name ?? "User"}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email}
            </span>
          </div>
          <EllipsisVertical className="ml-auto size-4 opacity-60" />
        </>
      )}
    </SidebarMenuButton>
  );

  const dropdownContent = (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-zinc-900 border-zinc-800"
      side={isMobile ? "bottom" : "right"}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={user?.image || "/avatar.png"}
              alt={user?.name ?? "User"}
            />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#00FF7F]/20 to-[#00FF7F]/10 text-[#00FF7F] font-semibold">
              {user?.name?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.name ?? "User"}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-zinc-800" />
      <DropdownMenuGroup>
        <EditProfile />
        <DrawerConfig />
        <DeleteAccountDialog />
      </DropdownMenuGroup>
      <DropdownMenuSeparator className="bg-zinc-800" />
      <DropdownMenuItem
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>{userButton}</DropdownMenuTrigger>
                {dropdownContent}
              </DropdownMenu>
            </SidebarMenuItem>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-zinc-900 border-zinc-700 text-white">
            <div className="text-sm">
              <p className="font-medium">{user?.name ?? "User"}</p>
              <p className="text-muted-foreground text-xs">{user?.email}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{userButton}</DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
