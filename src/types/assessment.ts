export interface Assessment {
  id: string;
  name: string;
  user: string;
  lastUpdated: string; // ISO 8601 date string
}

export interface DocumentParsing {
  imo_no: string;
  vessel_name: string;
  event_type: string[];
  parts: string[];
  date: string;
  port: string;
  vendor: string;
  cleaning_method: string | null;
  inspection_equipment: string | null;
  service_summary: string;
  report_summary: string;
}

export interface PartAssessment {
  part_name: string;
  provider_claim: string;
  agent_observation: string;
  traffic_light: 'green' | 'yellow' | 'red';
  reasoning: string;
  image_pages: number[];
}

export interface ReportAssessment {
  assessment_id: string;
  vessel_name: string;
  assessment_date: string;
  overall_summary: string;
  overall_traffic_light: 'green' | 'yellow' | 'red';
  total_parts?: number;
  green_count?: number;
  yellow_count?: number;
  red_count?: number;
  part_assessments: PartAssessment[];
  critical_issues: string[];
  notes: string;
}

export interface AssessmentWithData extends Assessment {
  ocr_results?: any[];
  document_parsing: DocumentParsing;
  assessment: ReportAssessment;
} 