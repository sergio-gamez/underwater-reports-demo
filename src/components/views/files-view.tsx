"use client";

import { useState, useEffect } from "react";
import { RecapSection } from "./assessment/recap-section";
import { SourceDocumentsSection } from "./assessment/source-documents-section";
import { useDebounce } from "@/hooks/useDebounce";
import { FileService } from "@/lib/file-service";
import { toast } from "sonner";

interface FilesViewProps {
  assessmentId: string;
  isNewAssessment: boolean;
  onTabChange?: (tab: string) => void;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface AssessmentFiles {
  recap?: string;
  baseCharterParty?: FileMetadata;
  riderClauses?: FileMetadata;
  additionalDocuments?: FileMetadata[];
}

export function FilesView({ assessmentId, isNewAssessment, onTabChange }: FilesViewProps) {
  const [recap, setRecap] = useState<string>("");
  const [files, setFiles] = useState<AssessmentFiles>({
    recap: "",
    additionalDocuments: []
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedRecap = useDebounce(recap, 500);

  // Load initial data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const savedFiles = FileService.loadAssessmentFiles(assessmentId);
      
      if (savedFiles) {
        setFiles(savedFiles);
        setRecap(savedFiles.recap || "");
      } else {
        // Load mock data for existing assessments
        const mockFiles = await FileService.loadMockFiles(assessmentId);
        if (mockFiles) {
          setFiles(mockFiles);
          setRecap(mockFiles.recap || "");
          FileService.saveAssessmentFiles(assessmentId, mockFiles);
        } else {
          // New assessment - empty state
          setFiles({ recap: "", additionalDocuments: [] });
          setRecap("");
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [assessmentId]);

  // Auto-save recap when it changes (debounced)
  useEffect(() => {
    if (!isLoading && debouncedRecap !== undefined) {
      setFiles(prevFiles => {
        const updatedFiles = { ...prevFiles, recap: debouncedRecap };
        FileService.saveAssessmentFiles(assessmentId, updatedFiles);
        return updatedFiles;
      });
    }
  }, [debouncedRecap, assessmentId, isLoading]);

  const handleRecapChange = (value: string) => {
    setRecap(value);
    setHasChanges(true);
  };

  const handleFilesChange = (newFiles: Omit<AssessmentFiles, 'recap'>) => {
    const updatedFiles = { ...newFiles, recap };
    setFiles(updatedFiles);
    setHasChanges(true);
    FileService.saveAssessmentFiles(assessmentId, updatedFiles);
  };

  const handleStartAnalysis = () => {
    toast.success("Analysis started! Switching to review mode...", {
      description: "In production, this would trigger our AI analysis.",
      duration: 5000
    });
    
    // Switch to "to-review" tab after a short delay
    setTimeout(() => {
      if (onTabChange) {
        onTabChange('to-review');
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Recap */}
      <RecapSection 
        value={recap}
        onChange={handleRecapChange}
        isNewAssessment={isNewAssessment}
      />

      {/* Right Column: Source Documents */}
      <SourceDocumentsSection
        files={{ 
          baseCharterParty: files.baseCharterParty,
          riderClauses: files.riderClauses,
          additionalDocuments: files.additionalDocuments
        }}
        onChange={handleFilesChange}
        onStartAnalysis={handleStartAnalysis}
        hasChanges={hasChanges}
        isNewAssessment={isNewAssessment}
      />
    </div>
  );
} 