"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MemoizedAnalysisCard } from "@/components/analysis/analysis-card";
import { Search } from "lucide-react";
import { generateStableId } from "@/lib/storage-utils";
import { AnalysisFilterTabs, triageTabs, TriageCategory, TabCategory } from "@/components/analysis/analysis-filter-tabs";
import type { AnalysisItem } from "@/types/analysis";
import { loadAssessmentData, loadAssessmentDataForTenant } from "@/lib/assessment-utils";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { StorageService } from "@/lib/storage-service";
import { TriageStatus } from "@/types/triage";
import { FILTER_ALL } from "@/lib/constants";
import { AnalysisEmptyState } from "@/components/analysis/analysis-empty-state";
import { Report, isReport } from "@/types/analysis";
import { sortAnalysisItems, sortRiskTypes } from "@/lib/sorting-utils";
import { FilesView } from "./files-view";

// Helper function to extract risk type from an item
const getRiskType = (item: AnalysisItem): string => {
  return item.type || item.risk_type || '';
};

interface AnalysisViewProps {
  assessmentId: string;
}

export function AnalysisView({ assessmentId }: AnalysisViewProps) {
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([FILTER_ALL]);
  const [activeTab, setActiveTab] = useState<TabCategory>('to-review'); // Default to to-review
  const [triageStatusMap, setTriageStatusMap] = useState<Map<string, TriageStatus>>(new Map());
  const [hasAnalysisData, setHasAnalysisData] = useState(false);

  const { username } = useAuth();

  const updateTriageStatus = useCallback(() => {
    const newMap = new Map<string, TriageStatus>();
    analysisItems.forEach(item => {
      const status = StorageService.getItemTriageStatus(item, assessmentId, username);
      if (status) {
        const itemId = generateStableId(item, assessmentId);
        newMap.set(itemId, status);
      }
    });
    setTriageStatusMap(newMap);
  }, [analysisItems, assessmentId, username]);

  const handleTriage = useCallback((item: AnalysisItem, newStatus: TriageStatus) => {
    if (!username) return;
    
    // Update localStorage
    const updatedStatus = StorageService.setItemTriageStatus(item, assessmentId, username, newStatus);
    
    // Update local state map
    setTriageStatusMap(prevMap => {
      const newMap = new Map(prevMap);
      const itemId = generateStableId(item, assessmentId);
      
      if (updatedStatus) {
        newMap.set(itemId, updatedStatus);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });
  }, [assessmentId, username]);

  const availableTypes = useMemo(() => {
    const types = new Set(analysisItems.map(getRiskType));
    const typeArray = Array.from(types).filter(Boolean) as string[];
    
    // Sort types by the same priority used in the main sorting
    return typeArray.sort(sortRiskTypes);
  }, [analysisItems]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const assessmentData = await loadAssessmentDataForTenant(assessmentId, username);
        if (assessmentData) {
          const risksReport = assessmentData.risks;
          const conflictsReport = assessmentData.conflicts;

          const risks = isReport<AnalysisItem>(risksReport) ? risksReport.risk_assessment_report ?? [] : [];
          const conflicts = isReport<AnalysisItem>(conflictsReport) ? conflictsReport.conflicts_report ?? [] : [];
          
          const hasData = risks.length > 0 || conflicts.length > 0;
          setHasAnalysisData(hasData);
          
          // If assessment has no analysis data, switch to "files" tab
          if (!hasData) {
            setActiveTab('files');
          }
          
          setAnalysisItems([...risks, ...conflicts]);
        } else {
          setError('Assessment not found');
        }
      } catch (error) {
        console.error('Error loading assessment data:', error);
        setError('Error loading assessment data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [assessmentId]);

  useEffect(() => {
    updateTriageStatus();

    const handleStorageChange = (event: StorageEvent) => {
      // We only care about triage status changes for the current assessment
      if (event.key === `${username}_triage_status_${assessmentId}`) {
        updateTriageStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [analysisItems, username, assessmentId, updateTriageStatus]);

  const filteredItems = useMemo(() => {
    // Don't filter if we're on the files tab
    if (activeTab === 'files') {
      return [];
    }
    
    let filtered = [...analysisItems];

    // Filter by triage status
    filtered = filtered.filter(item => {
      const itemId = generateStableId(item, assessmentId);
      const status = triageStatusMap.get(itemId);
      switch (activeTab) {
        case 'to-review': return !status;
        case 'negotiating': return status === 'negotiating';
        case 'accepted': return status === 'accepted';
        case 'dismissed': return status === 'dismissed';
        default: return true;
      }
    });

    // Filter by risk type
    const typesToShow = selectedTypes.filter(t => t !== FILTER_ALL);
    if (!selectedTypes.includes(FILTER_ALL) && typesToShow.length > 0) {
      filtered = filtered.filter(item => typesToShow.includes(getRiskType(item)));
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchFields = [
          item.title || '',
          item.description || '',
          item.risk_summary || '',
          item.resolution?.action || '',
          item.resolution?.suggested_redraft || '',
          ...(item.evidence || []).map(e => e.full_text || ''),
          ...(item.clause_references || []).map(e => e.description || '')
        ];
        return searchFields.some(field => field.toLowerCase().includes(searchLower));
      });
    }

    // Sort by risk type priority, then by title alphabetically
    filtered.sort(sortAnalysisItems);

    return filtered;
  }, [analysisItems, activeTab, selectedTypes, debouncedSearchTerm, triageStatusMap, assessmentId]);
  
  const tabCounts = useMemo(() => {
    const counts: Record<TriageCategory, number> = {
      'to-review': 0,
      negotiating: 0,
      accepted: 0,
      dismissed: 0,
    };
    analysisItems.forEach(item => {
      const itemId = generateStableId(item, assessmentId);
      const status = triageStatusMap.get(itemId);
      if (!status) {
        counts['to-review']++;
      } else {
        counts[status]++;
      }
    });
    return counts;
  }, [analysisItems, triageStatusMap, assessmentId]);

  const toggleType = useCallback((type: string) => {
    if (type === FILTER_ALL) {
      if (selectedTypes.includes(FILTER_ALL)) {
        setSelectedTypes([]);
      } else {
        setSelectedTypes([FILTER_ALL, ...availableTypes]);
      }
    } else {
      setSelectedTypes(prev => {
        let newSelected = prev.filter(t => t !== FILTER_ALL);
        if (prev.includes(type)) {
          newSelected = newSelected.filter(t => t !== type);
        } else {
          newSelected = [...newSelected, type];
          if (newSelected.length === availableTypes.length) {
            newSelected = [FILTER_ALL, ...newSelected];
          }
        }
        return newSelected;
      });
    }
  }, [availableTypes, selectedTypes]);

  return (
    <div>
      <div className="mb-6">
        <AnalysisFilterTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
      </div>

      {activeTab === 'files' ? (
        <FilesView 
          assessmentId={assessmentId} 
          isNewAssessment={!hasAnalysisData}
          onTabChange={(tab) => setActiveTab(tab as TabCategory)}
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
                  <div className="min-w-[300px]">
                    <Label className="mb-2 text-sm font-medium">Type</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <Badge
                        variant={selectedTypes.includes(FILTER_ALL) ? "secondary" : "outline"}
                        onClick={() => toggleType(FILTER_ALL)}
                        className="cursor-pointer"
                      >
                        All
                      </Badge>
                      
                      {availableTypes.map(type => (
                        <Badge
                          key={type}
                          variant={selectedTypes.includes(type) ? "secondary" : "outline"}
                          onClick={() => toggleType(type)}
                          className="cursor-pointer"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Label htmlFor="search" className="sr-only">Search</Label>
                  <SearchBar
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full sm:w-[300px]"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Loading analysis...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">{error}</h3>
                <p className="text-muted-foreground">This assessment does not have analysis data available yet.</p>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <AnalysisEmptyState hasAnalysisItems={analysisItems.length > 0} />
          ) : (
            <div>
              {filteredItems.map((item, index) => {
                const itemId = generateStableId(item, assessmentId);
                const status = triageStatusMap.get(itemId) || null;
                return (
                  <MemoizedAnalysisCard 
                    key={itemId}
                    item={item} 
                    index={index}
                    highlight={searchTerm}
                    assessmentId={assessmentId}
                    triageStatus={status}
                    onTriage={(newStatus) => handleTriage(item, newStatus)}
                    showActions={true}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
} 