"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemoizedAnalysisCard } from "@/components/analysis/analysis-card";
import type { FeedbackData } from "@/types/analysis";
import type { AnalysisItem } from "@/types/analysis";
import { FeedbackService } from "@/lib/feedback-service";
import { FILTER_ALL } from "@/lib/constants";
import { getAssessmentDisplayName } from "@/lib/assessment-utils";
import { FeedbackRating } from "@/types";
import { FeedbackDisplay } from "@/components/analysis/feedback-display";
import { useAuth } from "@/hooks/useAuth";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const ratingFilters: { label: string, value: FeedbackRating | 'All' }[] = [
  { label: "All", value: FILTER_ALL },
  { label: "Positive", value: "positive" },
  { label: "Negative", value: "negative" },
];

export function FeedbackManagementView() {
  const { username } = useAuth();
  const [allFeedback, setAllFeedback] = useState<FeedbackData[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([FILTER_ALL]);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  // Load feedback from Supabase
  const loadFeedback = useCallback(async () => {
    const feedback = await FeedbackService.getAllFeedback();
    setAllFeedback(feedback);
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleDeleteClick = (feedbackId: string) => {
    setFeedbackToDelete(feedbackId);
  };

  const confirmDeleteFeedback = useCallback(async () => {
    if (!feedbackToDelete) return;
    
    const result = await FeedbackService.removeFeedbackById(feedbackToDelete, username || 'admin');
    if (result.success) {
      const updatedFeedback = allFeedback.filter(f => f.id !== feedbackToDelete);
      setAllFeedback(updatedFeedback);
    } else {
      console.error('Failed to delete feedback:', result.error);
    }
    setFeedbackToDelete(null);
  }, [allFeedback, feedbackToDelete, username]);

  const exportFeedback = useCallback(() => {
    const exportData = allFeedback.map((feedback) => ({
      feedbackId: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment,
      timestamp: feedback.timestamp,
      userId: feedback.userId,
      title: feedback.title,
      assessmentId: feedback.assessmentId,
      itemData: feedback.itemData
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cpanalyzer_feedback_${new Date().toISOString().split("T")[0]}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [allFeedback]);

  // Toggle rating filter
  const toggleRating = useCallback((rating: string) => {
    if (rating === FILTER_ALL) {
      if (selectedRatings.includes(FILTER_ALL)) {
        setSelectedRatings([]);
      } else {
        setSelectedRatings(ratingFilters.map(f => f.value));
      }
    } else {
      setSelectedRatings(prev => {
        let newSelected = prev.filter(r => r !== FILTER_ALL);
        if (prev.includes(rating)) {
          newSelected = newSelected.filter(r => r !== rating);
        } else {
          newSelected.push(rating);
          // Check if all non-'All' options are now selected
          const allOptions = ratingFilters.filter(f => f.value !== FILTER_ALL).map(f => f.value);
          if (allOptions.every(opt => newSelected.includes(opt))) {
            newSelected = allOptions.concat(FILTER_ALL);
          }
        }
        return newSelected;
      });
    }
  }, [selectedRatings]);

  // Filter feedback
  const filteredFeedback = allFeedback.filter(f => {
    // Apply rating filter
    const ratingsToShow = selectedRatings.filter(r => r !== FILTER_ALL);
    if (selectedRatings.length === 0 || (!selectedRatings.includes(FILTER_ALL) && !ratingsToShow.includes(f.rating))) {
      return false;
    }
    
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">User Feedback</CardTitle>
              <CardDescription>
                Review and manage user feedback on risk assessments
              </CardDescription>
            </div>
            
            {allFeedback.length > 0 && (
              <Button 
                onClick={exportFeedback}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Feedback
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      {allFeedback.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-6 items-start">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {ratingFilters.map(filter => (
                    <Badge 
                      key={filter.value}
                      variant={selectedRatings.includes(filter.value) ? 'secondary' : 'outline'}
                      onClick={() => toggleRating(filter.value)}
                      className="cursor-pointer"
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="ml-auto text-sm text-muted-foreground">
                Showing {filteredFeedback.length} of {allFeedback.length} feedback items
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
            <p className="text-muted-foreground">
              User feedback will appear here when users rate risk assessments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((feedback, index) => {
            if (!feedback.itemData) return null;
            
            return (
              <div key={feedback.id} className="relative">
                <MemoizedAnalysisCard
                  item={feedback.itemData}
                  index={index}
                  assessmentId={feedback.assessmentId}
                  triageStatus={null} // Triage status is not managed in this view
                  onTriage={() => {}} // No-op, as triage actions are not shown
                  cardActions={
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(feedback.id)}
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete feedback"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete feedback</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  }
                  feedbackDisplay={
                    <FeedbackDisplay 
                      feedback={feedback} 
                    />
                  }
                  showActions={false}
                />
              </div>
            );
          })}
        </div>
      )}
      <AlertDialog open={!!feedbackToDelete} onOpenChange={(open) => !open && setFeedbackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the feedback record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFeedback}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 