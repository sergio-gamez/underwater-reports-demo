"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LoginForm } from "@/components/auth/login-form";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AssessmentsListView } from "@/components/views/assessments-list-view";
import { FeedbackManagementView } from "@/components/views/feedback-management-view";
import type { View } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { StorageService } from "@/lib/storage-service";

export default function Home() {
  const { isAuthenticated, username, isLoading, login, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>("risk-assessment");

  // Check if there's a stored view preference (from navigation)
  useState(() => {
    const storedView = StorageService.getActiveView();
    if (storedView === 'feedback') {
      setActiveView('feedback');
      StorageService.clearActiveView();
    }
  });

  const handleLogout = () => {
    logout();
    setActiveView("risk-assessment");
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <>
      <Toaster />
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-screen">
          <LoginForm onLogin={login} />
        </div>
      ) : (
        <div className="flex h-screen bg-background">
          <AppSidebar
            username={username}
            activeView={activeView}
            onViewChange={setActiveView}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 max-w-7xl">
              {activeView === "risk-assessment" && (
                <AssessmentsListView username={username} />
              )}
              {activeView === "feedback" && <FeedbackManagementView />}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
