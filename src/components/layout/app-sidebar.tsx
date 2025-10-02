"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  LogOut,
  Menu,
  X
} from "lucide-react";
import type { View } from "@/types";

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  username: string;
  onLogout: () => void;
}

export function AppSidebar({
  activeView,
  onViewChange,
  username,
  onLogout,
}: AppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const analysisNavItems: NavItem[] = [
    {
      id: 'risk-assessment',
      label: 'Risk Assessment',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  const NavButton = ({ item }: { item: NavItem }) => (
    <Button
      variant={activeView === item.id ? "secondary" : "ghost"}
      className="w-full justify-start"
      onClick={() => {
        onViewChange(item.id);
        setIsMobileMenuOpen(false);
      }}
    >
      {item.icon}
      <span className="ml-2">{item.label}</span>
    </Button>
  );

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Underwater Reports</h1>
            <p className="text-xs text-muted-foreground mt-1">Hull Inspection & Cleaning Analysis</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Navigation Items */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Analysis
            </h2>
            <div className="space-y-1">
              {analysisNavItems.map((item) => (
                <NavButton key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* User Section */}
      <div className="p-4 border-t">
        <div className="mb-3">
          <p className="text-sm font-medium">Welcome, {username}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col bg-card border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
} 