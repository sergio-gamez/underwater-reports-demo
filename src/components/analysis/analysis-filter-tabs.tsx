"use client";

import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export type TriageCategory = 'to-review' | 'negotiating' | 'accepted' | 'dismissed';
export type TabCategory = 'files' | TriageCategory;

interface AnalysisFilterTabsProps {
  activeTab: TabCategory;
  onTabChange: (tab: TabCategory) => void;
  counts: Record<TriageCategory, number>;
}

export const triageTabs: { id: TriageCategory; label: string }[] = [
  { id: 'to-review', label: 'To Review' },
  { id: 'negotiating', label: 'Negotiating' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'dismissed', label: 'Dismissed' },
];

export const allTabs: { id: TabCategory; label: string; icon?: React.ReactNode }[] = [
  { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> },
  ...triageTabs
];

export function AnalysisFilterTabs({ activeTab, onTabChange, counts }: AnalysisFilterTabsProps) {
  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id !== 'files' && (
              <span 
                className={cn(
                  "ml-1 py-0.5 px-2 rounded-full text-xs font-medium",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[tab.id as TriageCategory]}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
} 