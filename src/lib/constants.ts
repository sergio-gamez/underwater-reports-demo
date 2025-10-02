// Storage Keys
export const STORAGE_KEYS = {
  // Authentication
  IS_LOGGED_IN: 'cpanalyzer_logged_in',
  USERNAME: 'cpanalyzer_username',
  
  // Navigation
  ACTIVE_VIEW: 'cpanalyzer_active_view',
  
  // Assessments
  ASSESSMENTS: 'cpanalyzer_assessments',
  
  // Feedback
  ALL_FEEDBACK: 'cpanalyzer_all_feedback',
  FEEDBACK_PREFIX: 'feedback_',
  
  // Triage
  TRIAGE_STATUS_PREFIX: '_triage_status_',
} as const;

export const FILTER_ALL = 'All';

export const RISK_TYPE_PRIORITY: Record<string, number> = {
  'Potential Risk': 1,
  'Conflict': 2,
  'Missing Info': 3,
  'Near-Conflict': 4,
  'Ambiguity': 5,
} as const;

export const UNKNOWN_TYPE_PRIORITY = 0;

// Default Values
export const DEFAULTS = {
  USERNAME: 'User',
  ANONYMOUS_USERNAME: 'anonymous',
  NEW_ASSESSMENT_NAME: 'New Assessment',
} as const;

// File Names
export const FILE_PATTERNS = {
  RISK_FILE_SUFFIX: '_risks.json',
  CONFLICT_FILE_SUFFIX: '_conflicts.json',
} as const;

// Export File Names
export const EXPORT_FILENAME_PREFIX = 'cpanalyzer_feedback_'; 

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export const MOCK_ASSESSMENT_IDS = {
  BALTIC_ACE: 'baltic_ace',
  TEST_VESSEL: 'test_vessel'
} as const;

// Storage versioning for data migration
export const STORAGE_VERSION = '2.0.0'; // Incremented to force reload with new file discovery

// Development/Production flags
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'; 