"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  User,
  Palette,
  Key,
  CreditCard,
  Check,
  Save,
  Shield,
  Zap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { PRESET_BRAND_KITS } from "@/types/brand-kit";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "brand" | "api" | "billing">("profile");

  // Profile Form State
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane.doe@enterprise.com");
  const [company, setCompany] = useState("Acme Global");

  // Brand Kit State
  const [brandKits, setBrandKits] = useState(PRESET_BRAND_KITS);
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);

  // API State
  const [groqKey, setGroqKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile settings saved successfully.");
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 3000);
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Manage account preferences, brand kits, and API configurations"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border text-xs font-semibold gap-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "pb-3 flex items-center gap-2 transition-colors border-b-2",
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab("brand")}
            className={cn(
              "pb-3 flex items-center gap-2 transition-colors border-b-2",
              activeTab === "brand"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Palette className="w-4 h-4" />
            <span>Brand Kits</span>
          </button>

          <button
            onClick={() => setActiveTab("api")}
            className={cn(
              "pb-3 flex items-center gap-2 transition-colors border-b-2",
              activeTab === "api"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Key className="w-4 h-4" />
            <span>API & Infrastructure</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={cn(
              "pb-3 flex items-center gap-2 transition-colors border-b-2",
              activeTab === "billing"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span>Plans & Credits</span>
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleSaveProfile}
            className="space-y-6 p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md">
                JD
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Profile Picture</h3>
                <p className="text-xs text-muted-foreground">JPG or PNG under 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Role</label>
                <input
                  type="text"
                  defaultValue="Senior Product Designer"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Brand Kits */}
        {activeTab === "brand" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Active Brand Kits</h3>
                  <p className="text-xs text-muted-foreground">
                    Select a brand kit to apply automatically to new documents
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandKits.map((kit, idx) => (
                  <div
                    key={kit.name}
                    onClick={() => setActiveBrandIndex(idx)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 bg-background",
                      activeBrandIndex === idx
                        ? "border-primary ring-2 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{kit.name}</span>
                      {activeBrandIndex === idx && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Active Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden border border-border/50">
                      <div
                        className="flex-1 h-full"
                        style={{ backgroundColor: kit.colorPalette.primary }}
                      />
                      <div
                        className="flex-1 h-full"
                        style={{ backgroundColor: kit.colorPalette.secondary }}
                      />
                      <div
                        className="flex-1 h-full"
                        style={{ backgroundColor: kit.colorPalette.accent }}
                      />
                      <div
                        className="flex-1 h-full"
                        style={{ backgroundColor: kit.colorPalette.surface }}
                      />
                      <div
                        className="flex-1 h-full"
                        style={{ backgroundColor: kit.colorPalette.background }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Typography: {kit.typography.headingFont}</span>
                      <span>Radius: {kit.styleTokens.borderRadiusPx}px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: API & Infrastructure */}
        {activeTab === "api" && (
          <form
            onSubmit={handleSaveApiKey}
            className="p-6 rounded-2xl bg-card border border-border space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>AI Inference & Secret Keys</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Keys are stored securely on the server and are never exposed to client-side
                browsers.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Groq API Key (Optional Override)
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                SlideCraft AI uses server environment variables by default. Enter a custom key here
                if you wish to use your own quota.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border">
              {isKeySaved ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> API Key updated successfully!
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-sm"
              >
                Save Secret
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Billing & Usage */}
        {activeTab === "billing" && (
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  Pro Trial Plan
                </span>
                <h3 className="text-xl font-bold text-foreground mt-2">50 AI Credits Monthly</h3>
                <p className="text-xs text-muted-foreground">
                  Generates PowerPoint decks, posters, and vector charts
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/60 border border-border min-w-[180px]">
                <div className="text-xs text-muted-foreground mb-1">Credits Remaining</div>
                <div className="text-2xl font-black text-foreground">
                  42 <span className="text-xs text-muted-foreground font-normal">/ 50</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: "84%" }} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Next credit renewal: October 1st, 2026
              </span>
              <button
                onClick={() => alert("Redirecting to billing portal...")}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/95"
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
