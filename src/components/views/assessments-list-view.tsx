"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchBar } from '@/components/ui/search-bar';
import { FileText, Search } from 'lucide-react';
import { getAssessmentsForTenant, formatDate, loadAssessmentDataForTenant } from '@/lib/assessment-utils';
import { Assessment, AssessmentWithData } from '@/types/assessment';
import { useDebounce } from '@/hooks/useDebounce';

interface AssessmentWithCounts extends Assessment {
  trafficLights?: {
    red: number;
    yellow: number;
    green: number;
  };
}

interface AssessmentsListViewProps {
  username: string;
}

export function AssessmentsListView({ username }: AssessmentsListViewProps) {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentWithCounts[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Load assessments filtered by tenant and fetch their traffic light data
    async function loadAssessmentsWithCounts() {
      const baseAssessments = getAssessmentsForTenant(username);
      const assessmentsWithCounts = await Promise.all(
        baseAssessments.map(async (assessment) => {
          try {
            const data = await loadAssessmentDataForTenant(assessment.id, username);
            if (data?.assessment) {
              // Calculate counts from part_assessments if not provided
              let redCount = data.assessment.red_count ?? 0;
              let yellowCount = data.assessment.yellow_count ?? 0;
              let greenCount = data.assessment.green_count ?? 0;

              // If counts are not provided, calculate them from part_assessments
              if (redCount === 0 && yellowCount === 0 && greenCount === 0 && data.assessment.part_assessments?.length > 0) {
                redCount = data.assessment.part_assessments.filter(p => p.traffic_light === 'red').length;
                yellowCount = data.assessment.part_assessments.filter(p => p.traffic_light === 'yellow').length;
                greenCount = data.assessment.part_assessments.filter(p => p.traffic_light === 'green').length;
              }

              return {
                ...assessment,
                trafficLights: {
                  red: redCount,
                  yellow: yellowCount,
                  green: greenCount,
                }
              };
            }
          } catch (error) {
            console.error(`Error loading data for assessment ${assessment.id}:`, error);
          }
          return assessment;
        })
      );
      setAssessments(assessmentsWithCounts);
    }

    loadAssessmentsWithCounts();
  }, [username]);

  const handleAssessmentClick = (id: string) => {
    router.push(`/assessment/${id}`);
  };

  const filteredAndSortedAssessments = useMemo(() => {
    // Default sort assessments alphabetically by name
    let filteredAssessments = [...assessments].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Filter by search term if present
    if (debouncedSearchTerm.trim()) {
      const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
      filteredAssessments = filteredAssessments.filter((assessment) => {
        // Aggregate all searchable text from the card into one string
        const cardText = [
          assessment.name,
          assessment.user,
          formatDate(assessment.lastUpdated),
        ].join(' ');

        return cardText.toLowerCase().includes(lowercasedSearchTerm);
      });
    }

    return filteredAssessments;
  }, [assessments, debouncedSearchTerm]);

  return (
    <div className="flex-1">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Underwater Reports</CardTitle>
              <CardDescription>
                Select a report to view details or create a new one
              </CardDescription>
            </div>
            
            <div className="w-64">
              <SearchBar
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Assessments Grid */}
          {assessments.length > 0 ? (
            filteredAndSortedAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedAssessments.map((assessment) => {
                  const hasRedLight = assessment.trafficLights && assessment.trafficLights.red > 0;
                  return (
                    <Card
                      key={assessment.id}
                      className={`cursor-pointer hover:shadow-lg transition-shadow ${
                        hasRedLight
                          ? 'border-red-500 border-2 bg-red-50 dark:bg-red-950/20'
                          : ''
                      }`}
                      onClick={() => handleAssessmentClick(assessment.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-2">{assessment.name}</CardTitle>
                        <CardDescription>
                          by {assessment.user}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Last updated {formatDate(assessment.lastUpdated)}
                        </p>
                        {assessment.trafficLights && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              <span className="text-muted-foreground">{assessment.trafficLights.green}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <span className="text-muted-foreground">{assessment.trafficLights.yellow}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <span className="text-muted-foreground">{assessment.trafficLights.red}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-4">
                  Your search for "{searchTerm}" did not match any assessments.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assessments available</h3>
              <p className="text-muted-foreground">
                No reports are currently available for your account
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 