"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Presentation,
  Settings,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Command,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenCreateModal?: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create", href: "/create", icon: PlusCircle },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Editor", href: "/editor", icon: Presentation },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onOpenCreateModal,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Creator";

  return (
    <header className="h-14 w-full border-b border-border/80 bg-card/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm select-none transition-colors">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-7 h-7 rounded-lg gamma-gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-purple-500/25"
          >
            S
          </motion.div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">
              SlideCraft
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              AI
            </span>
          </div>
        </Link>

        {/* Workspace Pill */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-transparent hover:border-border/60">
          <span>Personal Workspace</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </div>

        {title && (
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-border/70 text-xs">
            <span className="font-semibold text-foreground truncate max-w-[220px]">{title}</span>
            {subtitle && <span className="text-muted-foreground hidden 2xl:inline text-[11px]">• {subtitle}</span>}
          </div>
        )}
      </div>

      {/* Center: Minimalist Top Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/create"
              ? pathname.startsWith("/create")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-medium transition-colors",
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>

              {isActive && (
                <motion.div
                  layoutId="headerNavUnderline"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10 border border-border/70"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right: Quick Command Search, Theme Toggle, New CTA & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search Shortcut */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border/70 bg-muted/30 text-muted-foreground text-xs hover:border-border transition-colors cursor-pointer"
             onClick={() => router.push("/projects")}
             title="Search projects (or press /)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">Search...</span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-background border border-border/60 text-muted-foreground">
            ⌘K
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Primary New Visual CTA */}
        {onOpenCreateModal ? (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full gamma-btn-primary text-xs font-semibold shadow-sm shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create with AI</span>
          </button>
        ) : (
          <Link
            href="/create"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full gamma-btn-primary text-xs font-semibold shadow-sm shadow-purple-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create with AI</span>
          </Link>
        )}

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg border border-border/70 bg-card hover:bg-muted/70 transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-primary/15 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-foreground hidden sm:inline max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onMouseLeave={() => setUserMenuOpen(false)}
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50 space-y-1"
              >
                <div className="px-2.5 py-1.5 border-b border-border/60">
                  <span className="text-xs font-semibold text-foreground block truncate">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {user?.email || "Local Workspace"}
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/projects"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>My Projects</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Settings</span>
                </Link>

                <div className="pt-1 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg border border-border/70 hover:bg-muted text-foreground"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-14 left-0 right-0 bg-card border-b border-border shadow-xl p-4 md:hidden flex flex-col gap-2 z-40"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted text-foreground"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
