"use client";

import { Card, CardContent } from "@/components/ui/card";

interface AnalysisEmptyStateProps {
  hasAnalysisItems: boolean;
}

export function AnalysisEmptyState({ hasAnalysisItems }: AnalysisEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {hasAnalysisItems ? (
          <p className="text-muted-foreground">No items match the current filters.</p>
        ) : (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              This charter party appears to be free of identified risks or conflicts.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
} 