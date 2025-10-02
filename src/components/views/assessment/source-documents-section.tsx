"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDropZone } from "./file-drop-zone";
import { AssessmentFiles, FileMetadata } from "../files-view";
import { toast } from "sonner";
import { ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface SourceDocumentsSectionProps {
  files: AssessmentFiles;
  onChange: (files: AssessmentFiles) => void;
  onStartAnalysis: () => void;
  hasChanges: boolean;
  isNewAssessment: boolean;
}

export function SourceDocumentsSection({
  files,
  onChange,
  onStartAnalysis,
  hasChanges,
  isNewAssessment
}: SourceDocumentsSectionProps) {
  const handleBaseCharterPartyChange = (newFiles: FileMetadata[]) => {
    onChange({
      ...files,
      baseCharterParty: newFiles[0] || undefined
    });
  };

  const handleRiderClausesChange = (newFiles: FileMetadata[]) => {
    onChange({
      ...files,
      riderClauses: newFiles[0] || undefined
    });
  };

  const handleAdditionalDocumentsChange = (newFiles: FileMetadata[]) => {
    onChange({
      ...files,
      additionalDocuments: newFiles
    });
  };

  const handleStartAnalysisClick = () => {
    if (!files.baseCharterParty) {
      toast.error("Please upload a Base Charter Party document");
      return;
    }
    
    onStartAnalysis();
  };

  // Determine if button should be enabled
  const isButtonEnabled = isNewAssessment || hasChanges;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Source Documents</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-6">
        <FileDropZone
          label="Base Charter Party"
          files={files.baseCharterParty ? [files.baseCharterParty] : []}
          maxFiles={1}
          onFilesChange={handleBaseCharterPartyChange}
          accept={ACCEPTED_FILE_TYPES.join(',')}
        />

        <FileDropZone
          label="Rider Clauses"
          files={files.riderClauses ? [files.riderClauses] : []}
          maxFiles={1}
          onFilesChange={handleRiderClausesChange}
          accept={ACCEPTED_FILE_TYPES.join(',')}
        />

        <FileDropZone
          label="Additional Documents"
          files={files.additionalDocuments || []}
          onFilesChange={handleAdditionalDocumentsChange}
          accept={ACCEPTED_FILE_TYPES.join(',')}
        />

        <div className="mt-auto pt-4">
          <Button 
            onClick={handleStartAnalysisClick}
            disabled={!isButtonEnabled}
            className="w-full"
            size="lg"
          >
            Start Analysis
          </Button>
          {!isNewAssessment && !hasChanges && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Modify recap or files to enable re-analysis
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 