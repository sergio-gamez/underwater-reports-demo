import { FeedbackRating } from ".";

export type RiskType = 'Potential Risk' | 'Ambiguity' | 'Missing Info' | 'Conflict' | 'Near-Conflict';

export type AnalysisItem = {
  title: string;
  type: RiskType;
  description: string;
  summary?: string;
  evidence?: any[];
  severity?: string;
  risk_type?: RiskType;
  risk_summary?: string;
  resolution?: {
    action: string;
    suggested_redraft?: string;
  };
  clause_references: Array<{
    clause: string;
    description: string;
    location: string;
    highlight?: string;
    full_text?: string;
    clause_reference?: string;
  }>;
  actions: Array<{
    action: string;
    owner: string;
    description?: string;
  }>;
  metadata: {
    vessel_name: string;
    charter_party_date: string;
  };
};

export interface FeedbackData {
  id: string;
  assessmentId: string;
  title: string;
  rating: FeedbackRating;
  comment?: string;
  timestamp: string;
  userId: string;
  itemData: AnalysisItem;
}

export interface Report<T> {
  [key: string]: T[];
}

export function isReport<T>(data: unknown): data is Report<T> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }
  return Object.values(data).every(value => Array.isArray(value));
}
