"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailView } from '@/components/views/report-detail-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Pencil, Check, X, Trash2, MoreVertical } from 'lucide-react';
import { getAssessment, getAssessmentForTenant, updateAssessment, deleteAssessment } from '@/lib/assessment-utils';
import { Assessment } from '@/types/assessment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { LoginForm } from "@/components/auth/login-form";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { View } from "@/types";
import { useAuth } from '@/hooks/useAuth';
import { StorageService } from '@/lib/storage-service';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, username, isLoading: isAuthLoading, login, logout } = useAuth();
  const assessmentId = params.id as string;
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>("risk-assessment");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAssessment = () => {
      if (!isAuthLoading && username) {
        const data = getAssessmentForTenant(assessmentId, username);
        if (data) {
          setAssessment(data);
          setEditedName(data.name);
        } else {
          router.push('/');
        }
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId, router, isAuthLoading, username]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsEditingName(true);
      // Clean the URL to prevent re-triggering on refresh.
      // Using `replace` avoids adding to the browser history.
      router.replace(`/assessment/${assessmentId}`, { scroll: false });
    }
    // The dependency array ensures this runs only when the query param is present on load.
  }, [searchParams, assessmentId, router]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleViewChange = (view: View) => {
    if (view === 'feedback') {
      StorageService.setActiveView('feedback');
    }
    router.push('/');
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
    setEditedName(assessment?.name || '');
  };

  const handleSaveName = () => {
    if (editedName.trim() && assessment) {
      const updated = updateAssessment(assessment.id, { name: editedName.trim() });
      if (updated) {
        setAssessment(updated);
        toast.success("Assessment name updated");
      }
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(assessment?.name || '');
    setIsEditingName(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveName();
    }
  };

  const handleDelete = () => {
    if (assessment) {
      const success = deleteAssessment(assessment.id);
      if (success) {
        toast.success("Assessment deleted");
        router.push('/');
      } else {
        toast.error("Failed to delete assessment");
      }
    }
    setShowDeleteDialog(false);
  };

  const handleBackToList = () => {
    router.push('/');
  };


  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Toaster />
        <LoginForm onLogin={login} />
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Toaster />
      
      <AppSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        username={username}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <div>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          ref={inputRef}
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          onKeyDown={handleInputKeyDown}
                          className="h-9 w-64"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveName}
                          disabled={!editedName.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{assessment.name}</CardTitle>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleStartEditName}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <CardDescription>
                      Charter Party Analysis by {assessment.user}
                    </CardDescription>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>

          {/* Report Detail View */}
          <ReportDetailView assessmentId={assessmentId} />
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assessment.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 