"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { getAssessmentDisplayName } from "@/lib/assessment-utils";
import type { FeedbackData } from "@/types/analysis";

interface FeedbackDisplayProps {
  feedback: FeedbackData;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <div className="mt-auto pt-4">
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          {/* Metadata */}
          <span className="text-xs text-muted-foreground">
            {feedback.userId} • {new Date(feedback.timestamp).toLocaleDateString()} • 
            📊 {getAssessmentDisplayName(feedback.assessmentId)} • Risk Assessment
          </span>
          
          <div className="flex items-center gap-2">
            {/* Rating display */}
            <div className={feedback.rating === 'positive' 
              ? "bg-primary/10 text-primary p-1.5 rounded" 
              : "bg-destructive/10 text-destructive p-1.5 rounded"
            }>
              {feedback.rating === 'positive' ? (
                <ThumbsUp className="h-3.5 w-3.5 fill-current" />
              ) : (
                <ThumbsDown className="h-3.5 w-3.5 fill-current" />
              )}
            </div>
          </div>
        </div>
        
        {/* Comment display if exists */}
        {feedback.comment && (
          <div className="w-full mt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                {feedback.comment}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 