"use client";

import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CreateWithAiModal } from "@/components/dashboard/CreateWithAiModal";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  hideSidebar?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitle,
  hideSidebar = false,
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Gamma Left Navigation Sidebar (Desktop) */}
      {!hideSidebar && (
        <div className="hidden md:block">
          <AppSidebar onOpenCreateModal={() => setCreateModalOpen(true)} />
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        {/* Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative bg-canvas-dots">
          {children}
        </main>
      </div>

      {/* Global Gamma Create With AI Modal */}
      <CreateWithAiModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
