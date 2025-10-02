import { Assessment, AssessmentWithData } from '@/types/assessment';
import { StorageService } from './storage-service';
import { TenantId, getTenantAssessments, getUserTenant, canTenantAccessAssessment } from '@/components/auth/login-form';

// Mock assessments based on existing datasets
export const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: 'photo_inspection_mv_crystalya',
    name: 'MV Crystalia - Photo Inspection',
    user: 'LDC Operations',
    lastUpdated: '2025-05-19T10:30:00Z'
  },
  {
    id: 'cleaning_report_mv_crystalya',
    name: 'MV Crystalia - Cleaning Report',
    user: 'LDC Operations',
    lastUpdated: '2025-07-09T14:20:00Z'
  }
];

export function getAssessmentDisplayName(assessmentId: string): string {
  const assessment = getAssessment(assessmentId);
  return assessment ? assessment.name : assessmentId;
}

// Initialize assessments in localStorage if not present
function initializeAssessments(): Assessment[] {
  const stored = StorageService.getAssessments();
  
  // If the number of mock assessments has changed, overwrite the stored data.
  // This ensures that new demo data is always reflected after a deployment.
  if (stored.length === 0 || MOCK_ASSESSMENTS.length !== stored.filter(s => MOCK_ASSESSMENTS.some(m => m.id === s.id)).length) {
    const userCreatedAssessments = stored.filter(s => !MOCK_ASSESSMENTS.some(m => m.id === s.id));
    const newAssessments = [...MOCK_ASSESSMENTS, ...userCreatedAssessments];
    StorageService.saveAssessments(newAssessments);
    return newAssessments;
  }
  
  return stored;
}

// Get all assessments
export function getAssessments(): Assessment[] {
  return initializeAssessments();
}

// Get assessments filtered by tenant
export function getAssessmentsForTenant(username: string): Assessment[] {
  const allAssessments = getAssessments();
  const userTenant = getUserTenant(username);

  if (!userTenant) {
    return allAssessments;
  }

  const tenantAssessmentIds = getTenantAssessments(userTenant);

  return allAssessments.filter(assessment => {
    if (tenantAssessmentIds.includes(assessment.id)) {
      return true;
    }

    if (assessment.user === username) {
      return true;
    }

    return false;
  });
}

// Get a single assessment by ID
export function getAssessment(id: string): Assessment | null {
  const assessments = getAssessments();
  return assessments.find(a => a.id === id) || null;
}

// Get a single assessment by ID with tenant access control
export function getAssessmentForTenant(id: string, username: string): Assessment | null {
  const assessment = getAssessment(id);
  if (!assessment) return null;

  const userTenant = getUserTenant(username);
  if (!userTenant) {
    return assessment;
  }

  if (canTenantAccessAssessment(userTenant, id) || assessment.user === username) {
    return assessment;
  }

  return null;
}

// Create a new assessment
export function createAssessment(name: string, user: string): Assessment {
  const assessments = getAssessments();
  const newAssessment: Assessment = {
    id: `assessment_${Date.now()}`,
    name,
    user,
    lastUpdated: new Date().toISOString()
  };
  
  assessments.push(newAssessment);
  StorageService.saveAssessments(assessments);
  return newAssessment;
}

// Update an assessment
export function updateAssessment(id: string, updates: Partial<Assessment>): Assessment | null {
  const assessments = getAssessments();
  const index = assessments.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  assessments[index] = {
    ...assessments[index],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  StorageService.saveAssessments(assessments);
  return assessments[index];
}

// Delete an assessment
export function deleteAssessment(id: string): boolean {
  const assessments = getAssessments();
  const filtered = assessments.filter(a => a.id !== id);
  
  if (filtered.length === assessments.length) return false;
  
  StorageService.saveAssessments(filtered);
  return true;
}

// Load assessment data (conflicts and risks)
export async function loadAssessmentData(id: string): Promise<AssessmentWithData | null> {
  const assessment = getAssessment(id);
  if (!assessment) return null;

  return loadAssessmentDataInternal(assessment);
}

// Load assessment data with tenant access control
export async function loadAssessmentDataForTenant(id: string, username: string): Promise<AssessmentWithData | null> {
  const assessment = getAssessmentForTenant(id, username);
  if (!assessment) return null;

  return loadAssessmentDataInternal(assessment);
}

// Internal helper for loading assessment data
async function loadAssessmentDataInternal(assessment: Assessment): Promise<AssessmentWithData | null> {
  try {
    // For mock assessments, load from public JSON files
    if (MOCK_ASSESSMENTS.some(a => a.id === assessment.id)) {
      const response = await fetch(`/${assessment.id}.json`);
      const data = await response.json();

      return {
        ...assessment,
        ocr_results: data.ocr_results,
        document_parsing: data.document_parsing,
        assessment: data.assessment
      };
    }

    // For new assessments, return empty data
    return {
      ...assessment,
      ocr_results: [],
      document_parsing: {
        imo_no: '',
        vessel_name: '',
        event_type: [],
        parts: [],
        date: '',
        port: '',
        vendor: '',
        cleaning_method: null,
        inspection_equipment: null,
        service_summary: '',
        report_summary: ''
      },
      assessment: {
        assessment_id: assessment.id,
        vessel_name: '',
        assessment_date: '',
        overall_summary: '',
        overall_traffic_light: 'green',
        part_assessments: [],
        critical_issues: [],
        notes: ''
      }
    };
  } catch (error) {
    console.error('Error loading assessment data:', error);
    return {
      ...assessment,
      ocr_results: [],
      document_parsing: {
        imo_no: '',
        vessel_name: '',
        event_type: [],
        parts: [],
        date: '',
        port: '',
        vendor: '',
        cleaning_method: null,
        inspection_equipment: null,
        service_summary: '',
        report_summary: ''
      },
      assessment: {
        assessment_id: assessment.id,
        vessel_name: '',
        assessment_date: '',
        overall_summary: '',
        overall_traffic_light: 'green',
        part_assessments: [],
        critical_issues: [],
        notes: ''
      }
    };
  }
}

const timeUnits: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
];

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const { unit, seconds } of timeUnits) {
    const value = Math.round(diffSeconds / seconds);
    if (Math.abs(value) > 0) {
      return rtf.format(-value, unit);
    }
  }

  return 'just now';
} 