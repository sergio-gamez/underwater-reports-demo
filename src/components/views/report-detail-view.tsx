"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { loadAssessmentDataForTenant } from "@/lib/assessment-utils";
import { useAuth } from "@/hooks/useAuth";
import { AssessmentWithData, PartAssessment } from "@/types/assessment";
import { Ship, Calendar, MapPin, Building2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportDetailViewProps {
  assessmentId: string;
}

function TrafficLight({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const config = {
    green: { color: 'bg-green-500', label: 'Good', icon: CheckCircle2 },
    yellow: { color: 'bg-yellow-500', label: 'Caution', icon: AlertTriangle },
    red: { color: 'bg-red-500', label: 'Issue', icon: AlertCircle }
  };

  const { color, label, icon: Icon } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <Icon className={`h-4 w-4 ${status === 'green' ? 'text-green-600' : status === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ReportDetailView({ assessmentId }: ReportDetailViewProps) {
  const [data, setData] = useState<AssessmentWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const assessmentData = await loadAssessmentDataForTenant(assessmentId, username);
        if (assessmentData) {
          setData(assessmentData);
        } else {
          setError('Report not found');
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        setError('Error loading report data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assessmentId, username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading report...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{error || 'Report not found'}</div>
      </div>
    );
  }

  const { document_parsing, assessment } = data;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Report Overview</CardTitle>
              <CardDescription>
                {document_parsing.event_type.join(', ')} - {new Date(document_parsing.date).toLocaleDateString()}
              </CardDescription>
            </div>
            <TrafficLight status={assessment.overall_traffic_light} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Ship className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Vessel</div>
                <div className="text-base font-semibold">{document_parsing.vessel_name}</div>
                <div className="text-xs text-muted-foreground">IMO: {document_parsing.imo_no}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Vendor</div>
                <div className="text-base">{document_parsing.vendor}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div className="text-base">{document_parsing.port}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div className="text-base">{new Date(document_parsing.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Summary */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Service Summary</h3>
            <p className="text-sm text-muted-foreground">{document_parsing.service_summary}</p>
          </div>

          {/* Equipment & Method */}
          {(document_parsing.inspection_equipment || document_parsing.cleaning_method) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document_parsing.inspection_equipment && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Inspection Equipment</h3>
                    <p className="text-sm text-muted-foreground">{document_parsing.inspection_equipment}</p>
                  </div>
                )}
                {document_parsing.cleaning_method && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Cleaning Method</h3>
                    <p className="text-sm text-muted-foreground">{document_parsing.cleaning_method}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Assessment Summary */}
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Assessment Summary</h3>
              {(assessment.green_count !== undefined || assessment.yellow_count !== undefined || assessment.red_count !== undefined) && (
                <div className="flex items-center gap-4">
                  {assessment.green_count !== undefined && (
                    <Badge variant="outline" className="gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {assessment.green_count}
                    </Badge>
                  )}
                  {assessment.yellow_count !== undefined && (
                    <Badge variant="outline" className="gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      {assessment.yellow_count}
                    </Badge>
                  )}
                  {assessment.red_count !== undefined && (
                    <Badge variant="outline" className="gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {assessment.red_count}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{assessment.overall_summary}</p>
          </div>

          {/* Critical Issues */}
          {assessment.critical_issues && assessment.critical_issues.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2 text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Critical Issues
                </h3>
                <ul className="space-y-1">
                  {assessment.critical_issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-red-500">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Parts Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Part Assessments</CardTitle>
          <CardDescription>
            Detailed assessment of {assessment.part_assessments.length} parts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.part_assessments.map((part, idx) => (
              <Card key={idx} className="border-l-4" style={{
                borderLeftColor: part.traffic_light === 'green' ? 'rgb(34 197 94)' :
                                 part.traffic_light === 'yellow' ? 'rgb(234 179 8)' :
                                 'rgb(239 68 68)'
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{part.part_name}</CardTitle>
                    <TrafficLight status={part.traffic_light} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Provider Claim</h4>
                    <p className="text-sm text-muted-foreground">{part.provider_claim}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">AI Agent Observation</h4>
                    <p className="text-sm text-muted-foreground">{part.agent_observation}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Reasoning</h4>
                    <p className="text-sm text-muted-foreground">{part.reasoning}</p>
                  </div>
                  {part.image_pages && part.image_pages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Referenced Images</h4>
                      <div className="flex flex-wrap gap-1">
                        {part.image_pages.map((page) => (
                          <Badge key={page} variant="secondary" className="text-xs">
                            Page {page}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {assessment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{assessment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
