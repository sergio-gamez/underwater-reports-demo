// Types for CPAnalyzer

import { AnalysisItem } from './analysis';

export interface Evidence {
  clause_reference: string;
  full_text: string;
  highlight?: string;
  text_extract?: string;
}

export interface Resolution {
  action: string;
  suggested_redraft?: string;
}

export type FeedbackRating = 'positive' | 'negative';

export interface FeedbackData {
  id: string;
  itemType: 'analysis';
  dataset: string;
  title: string;
  rating: 'positive' | 'negative';
  comment: string;
  timestamp: string;
  userId: string;
  itemData?: AnalysisItem;
}

export type View = 'risk-assessment' | 'feedback'; 