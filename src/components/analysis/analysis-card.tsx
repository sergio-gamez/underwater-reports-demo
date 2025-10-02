"use client";

import { useState, useEffect, useRef, useCallback, memo, useLayoutEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check,
  RotateCcw,
  ShieldCheck,
  Flag,
  EyeOff,
  Trash2,
  LucideIcon
} from "lucide-react";
import { createRedraftKey } from "@/lib/storage-utils";
import { FeedbackSection } from "@/components/analysis/feedback-section";
import type { AnalysisItem } from "@/types/analysis";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { StorageService } from "@/lib/storage-service";
import { TriageStatus } from "@/types/triage";

interface TriageAction {
  status: TriageStatus;
  label: string;
  activeLabel: string;
  icon: LucideIcon;
}

const triageActions: TriageAction[] = [
  { status: 'negotiating', label: 'Flag for Negotiation', activeLabel: 'Move to Review', icon: Flag },
  { status: 'accepted', label: 'Accept', activeLabel: 'Move to Review', icon: ShieldCheck },
  { status: 'dismissed', label: 'Dismiss', activeLabel: 'Move to Review', icon: EyeOff },
];

interface AnalysisCardProps {
  item: AnalysisItem;
  index: number;
  assessmentId: string;
  triageStatus: TriageStatus | null;
  onTriage: (newStatus: TriageStatus) => void;
  highlight?: string;
  feedbackDisplay?: React.ReactNode; 
  showActions?: boolean;
  cardActions?: React.ReactNode;
}

export function AnalysisCard({ 
  item, 
  index, 
  assessmentId,
  triageStatus,
  onTriage,
  highlight,
  feedbackDisplay, 
  showActions = true,
  cardActions,
}: AnalysisCardProps) {
  const { username } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const redraftStorageKey = createRedraftKey(item, assessmentId);
  const suggestedRedraft = item.resolution?.suggested_redraft || '';

  const [editedRedraft, setEditedRedraft] = useState(suggestedRedraft);

  const MAX_TEXTAREA_HEIGHT = 400;

  // Adjust textarea height dynamically
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      
      if (scrollHeight > MAX_TEXTAREA_HEIGHT) {
        textareaRef.current.style.height = `${MAX_TEXTAREA_HEIGHT}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [editedRedraft]); // Recalculate on content change

  // Load initial state from storage for redraft only
  useEffect(() => {
    const savedRedraft = StorageService.getRedraft(redraftStorageKey);
    if (savedRedraft !== null) {
      setEditedRedraft(savedRedraft);
    }
  }, [redraftStorageKey]);

  // Save changes to redraft automatically
  useEffect(() => {
    if (editedRedraft !== suggestedRedraft) {
      StorageService.saveRedraft(redraftStorageKey, editedRedraft);
    } else {
      // If content is the same as original, remove from storage to save space
      StorageService.removeRedraft(redraftStorageKey);
    }
  }, [editedRedraft, suggestedRedraft, redraftStorageKey]);

  const handleTriage = useCallback((status: TriageStatus) => {
    onTriage(status);
  }, [onTriage]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);
  
  const handleRevert = useCallback(() => {
    setEditedRedraft(suggestedRedraft);
  }, [suggestedRedraft]);

  const typeVariantMapping: Record<string, "default" | "secondary" | "destructive" | "outline" | "warning"> = {
    'Missing Info': 'warning',
    'Ambiguity': 'default',
    'Potential Risk': 'destructive',
    'Potential Risk / Deviation': 'destructive',
    'Conflict': 'destructive',
    'Near-Conflict': 'default',
  };

  const getItemTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    return typeVariantMapping[type] || 'default';
  };

  const highlightText = (fullText: string, highlight?: string) => {
    if (!highlight || !fullText) return fullText;
    
    const parts = fullText.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === highlight.toLowerCase()) {
        return <mark key={index} className="bg-primary/20">{part}</mark>;
      }
      return part;
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getItemTypeVariant(item.type || item.risk_type || '')} className="shrink-0">
              {item.type || item.risk_type}
            </Badge>

            {showActions && (
              <div className="flex items-center gap-1">
                {triageActions.map(action => (
                  <TooltipProvider key={action.status}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant={triageStatus === action.status ? "secondary" : "ghost"}
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleTriage(action.status)}
                        >
                          <action.icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{triageStatus === action.status ? action.activeLabel : action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
            {cardActions}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Summary + Resolution */}
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.summary || item.description || item.risk_summary}
              </p>
            </div>

            {/* Resolution Suggestion */}
            {(item.resolution || item.actions) && (
              <div className="rounded-lg border bg-primary/5 p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Resolution Suggestion
                </h4>
                
                <div className="space-y-3">
                  {item.resolution?.action && (
                    <p className="text-sm">
                      <span className="font-medium">Action:</span> {item.resolution.action}
                    </p>
                  )}
                  {item.actions?.map((action, i) => (
                    <p key={i} className="text-sm">
                      <span className="font-medium">{action.action}:</span> {action.owner}
                    </p>
                  ))}

                  {suggestedRedraft && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Suggested Redraft:</h5>
                        <div className="flex gap-1">
                          {editedRedraft !== suggestedRedraft && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleRevert}
                              className="h-7 px-2"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Revert
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(editedRedraft)}
                            className="h-7 px-2"
                          >
                            {copied ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            {copied ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={editedRedraft}
                        onChange={(e) => setEditedRedraft(e.target.value)}
                        className="w-full min-h-[100px] p-3 text-xs rounded-md border bg-background"
                        placeholder="Enter suggested redraft..."
                        style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
                      />
                      {editedRedraft !== suggestedRedraft && (
                        <p className="text-xs text-muted-foreground">
                          ✏️ Edited (changes saved locally)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Evidence */}
          <div className="flex flex-col">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Evidence</h4>
                {(item.clause_references || item.evidence) && ((item.clause_references && item.clause_references.length > 0) || (item.evidence && item.evidence.length > 0)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEvidenceExpanded(!evidenceExpanded)}
                    className="h-7 px-2"
                  >
                    {evidenceExpanded ? (
                      <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                    ) : (
                      <>Read More <ChevronDown className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>

              {(item.clause_references && item.clause_references.length > 0) || (item.evidence && item.evidence.length > 0) ? (
                <div className="space-y-3">
                  {item.clause_references?.map((evidence, evidenceIndex) => (
                    <div key={evidenceIndex} className="rounded-lg border p-3">
                      <h5 className="text-sm font-medium mb-2">
                        {evidence.clause_reference || evidence.clause}
                      </h5>
                      
                      {evidenceExpanded ? (
                        <div className="text-sm text-muted-foreground">
                          {highlightText(evidence.full_text || evidence.description, evidence.highlight || highlight)}
                        </div>
                      ) : (
                        <blockquote className="text-sm italic border-l-4 border-muted pl-3 text-muted-foreground">
                          {evidence.highlight || evidence.description}
                        </blockquote>
                      )}
                    </div>
                  ))}
                  {item.evidence?.map((evidence, evidenceIndex) => (
                    <div key={evidenceIndex} className="rounded-lg border p-3">
                      <h5 className="text-sm font-medium mb-2">
                        {evidence.clause_reference}
                      </h5>
                      
                      {evidenceExpanded ? (
                        <div className="text-sm text-muted-foreground">
                          {highlightText(evidence.full_text, evidence.highlight)}
                        </div>
                      ) : (
                        <blockquote className="text-sm italic border-l-4 border-muted pl-3 text-muted-foreground">
                          {evidence.highlight}
                        </blockquote>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No evidence provided</p>
              )}
            </div>

            {/* Actions Section - at bottom of right column */}
            <div className="mt-auto pt-4">
              {feedbackDisplay ? (
                feedbackDisplay
              ) : (
                <FeedbackSection itemData={item} assessmentId={assessmentId} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const MemoizedAnalysisCard = memo(AnalysisCard); 