"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileMetadata } from "../files-view";
import { FILE_SIZE_LIMIT, ACCEPTED_MIME_TYPES } from "@/lib/constants";
import { toast } from "sonner";

interface FileDropZoneProps {
  label: string;
  files: FileMetadata[];
  maxFiles?: number;
  onFilesChange: (files: FileMetadata[]) => void;
  accept?: string;
  className?: string;
}

export function FileDropZone({ 
  label, 
  files, 
  maxFiles = Infinity, 
  onFilesChange, 
  accept,
  className 
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    // Validate files
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > FILE_SIZE_LIMIT) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      // Check file type
      if (!ACCEPTED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
        toast.error(`${file.name} is not a supported file type.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    const fileMetadata: FileMetadata[] = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));

    if (maxFiles === 1) {
      onFilesChange(fileMetadata.slice(0, 1));
    } else {
      const updatedFiles = [...files, ...fileMetadata].slice(0, maxFiles);
      onFilesChange(updatedFiles);
    }
  }, [files, maxFiles, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{label}</p>
        {maxFiles !== Infinity && (
          <span className="text-xs text-muted-foreground">
            {files.length}/{maxFiles}
          </span>
        )}
      </div>

      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            "mb-3"
          )}
        >
          <input
            type="file"
            id={`file-input-${label}`}
            className="hidden"
            onChange={handleFileInput}
            accept={accept}
            multiple={maxFiles !== 1}
          />
          <label htmlFor={`file-input-${label}`} className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to upload
            </p>
          </label>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <span className="text-sm truncate flex-1">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 p-1 hover:bg-background rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 