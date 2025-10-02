import { AnalysisItem } from "@/types/analysis";

export const generateStableId = (item: AnalysisItem, assessmentId: string): string => {
  // Combine key fields to create a unique and stable ID
  const summary = item.description || item.risk_summary || '';
  const uniqueContent = `${assessmentId}_${item.title}_${summary}`;
  
  // Simple hash function (not for crypto)
  let hash = 0;
  for (let i = 0; i < uniqueContent.length; i++) {
    const char = uniqueContent.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16); // Return as hex
};


export const createRedraftKey = (item: AnalysisItem, assessmentId: string): string => {
  const id = generateStableId(item, assessmentId);
  return `redraft_${id}`;
};

export const createFeedbackKey = (item: AnalysisItem, assessmentId: string): string => {
  const id = generateStableId(item, assessmentId);
  return `feedback_${id}`;
}; 