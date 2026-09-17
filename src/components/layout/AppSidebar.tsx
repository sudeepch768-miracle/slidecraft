"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  FileText,
  Clock,
  LayoutGrid,
  Palette,
  Folder,
  Trash2,
  Plus,
  ChevronDown,
  LogOut,
  LogIn,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
  onOpenCreateModal?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  className,
  onNavigate,
  onOpenCreateModal,
}) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Creator");

  const initials =
    displayName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GA";

  const MAIN_NAV = [
    { label: "All gammas", href: "/dashboard", icon: FileText },
    { label: "Recent", href: "/dashboard?filter=recent", icon: Clock },
    { label: "Templates", href: "/create", icon: LayoutGrid },
    { label: "Custom themes", href: "/settings?tab=themes", icon: Palette },
    { label: "Trash", href: "/dashboard?filter=trash", icon: Trash2 },
  ];

  return (
    <aside
      className={cn(
        "w-60 h-screen border-r border-border/80 bg-card/95 backdrop-blur-md flex flex-col justify-between select-none z-30 flex-shrink-0 transition-colors",
        className
      )}
    >
      {/* Upper Half: Brand, Workspace & Nav */}
      <div className="flex flex-col min-h-0">
        {/* Workspace Switcher Header */}
        <div className="p-3.5 border-b border-border/70">
          <div className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg gamma-gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    Personal
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {user?.email || "free workspace"}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
            </button>
          </div>
        </div>

        {/* Primary CTA: Create with AI */}
        <div className="p-3">
          {onOpenCreateModal ? (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="w-full py-2.5 px-3.5 rounded-xl gamma-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-purple-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create with AI</span>
            </button>
          ) : (
            <Link
              href="/dashboard?create=true"
              onClick={onNavigate}
              className="w-full py-2.5 px-3.5 rounded-xl gamma-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-purple-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create with AI</span>
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-1 space-y-0.5 overflow-y-auto flex-1">
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Folders Section */}
          <div className="pt-4 pb-1 px-3 flex items-center justify-between text-[11px] font-semibold text-muted-foreground/70 tracking-wider uppercase">
            <span>Folders</span>
            <button
              type="button"
              className="w-4 h-4 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              title="New folder"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="px-3 py-1.5 text-xs text-muted-foreground/60 flex items-center gap-2 italic">
            <Folder className="w-3.5 h-3.5 opacity-50" />
            <span>No folders yet</span>
          </div>
        </div>
      </div>

      {/* Lower Half: Pro Banner, User & Settings */}
      <div className="p-3 border-t border-border/70 space-y-2.5 bg-muted/10">
        {/* Gamma Pro Upgrade Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
            <Zap className="w-3.5 h-3.5 text-purple-500" />
            <span>Gamma Plus</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            Unlimited AI creation, custom fonts & export without watermark.
          </p>
          <button
            type="button"
            className="mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Upgrade Plan
          </button>
        </div>

        {/* Profile Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full gamma-gradient-primary text-white flex items-center justify-center font-bold text-[10px]">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                {displayName}
              </div>
              <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                Free tier
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                title="Log in"
              >
                <LogIn className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
