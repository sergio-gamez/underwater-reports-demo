import { AnalysisItem } from "@/types/analysis";
import { RISK_TYPE_PRIORITY, UNKNOWN_TYPE_PRIORITY } from "@/lib/constants";

// Helper function to extract risk type from an item
const getRiskType = (item: AnalysisItem): string => {
  return item.type || item.risk_type || '';
};

export const sortAnalysisItems = (a: AnalysisItem, b: AnalysisItem): number => {
  const typeA = getRiskType(a);
  const typeB = getRiskType(b);
  
  const priorityA = RISK_TYPE_PRIORITY[typeA] ?? UNKNOWN_TYPE_PRIORITY;
  const priorityB = RISK_TYPE_PRIORITY[typeB] ?? UNKNOWN_TYPE_PRIORITY;
  
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }
  
  const titleA = a.title || '';
  const titleB = b.title || '';
  return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
};

export const sortRiskTypes = (a: string, b: string): number => {
  const priorityA = RISK_TYPE_PRIORITY[a] ?? UNKNOWN_TYPE_PRIORITY;
  const priorityB = RISK_TYPE_PRIORITY[b] ?? UNKNOWN_TYPE_PRIORITY;
  
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }
  
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}; 