import { AssessmentFiles, FileMetadata } from "@/components/views/files-view";
import { MOCK_ASSESSMENT_IDS, STORAGE_VERSION, IS_DEVELOPMENT } from "@/lib/constants";
import { fileDiscoveryService } from "@/lib/file-discovery-service";

const STORAGE_PREFIX = "assessment_files_";

interface StoredAssessmentFiles extends AssessmentFiles {
  _version?: string;
}

// Validate file metadata structure
const isValidFileMetadata = (data: any): data is FileMetadata => {
  return data &&
    typeof data.name === 'string' &&
    typeof data.size === 'number' &&
    typeof data.type === 'string' &&
    typeof data.lastModified === 'number';
};

// Validate assessment files structure
const isValidAssessmentFiles = (data: any): data is AssessmentFiles => {
  if (!data || typeof data !== 'object') return false;
  
  // Validate optional fields
  if (data.recap !== undefined && typeof data.recap !== 'string') return false;
  if (data.baseCharterParty && !isValidFileMetadata(data.baseCharterParty)) return false;
  if (data.riderClauses && !isValidFileMetadata(data.riderClauses)) return false;
  
  // Validate additional documents array
  if (data.additionalDocuments) {
    if (!Array.isArray(data.additionalDocuments)) return false;
    if (!data.additionalDocuments.every(isValidFileMetadata)) return false;
  }
  
  return true;
};

// List of assessments that have mock files available
const ASSESSMENTS_WITH_FILES = Object.values(MOCK_ASSESSMENT_IDS) as string[];

// Check if stored data needs migration or is empty
const needsMigration = (data: StoredAssessmentFiles, assessmentId: string): boolean => {
  // Check version mismatch
  if (data._version !== STORAGE_VERSION) {
    return true;
  }
  
  // Check if it's a mock assessment with empty or incomplete data
  if (ASSESSMENTS_WITH_FILES.includes(assessmentId)) {
    // For assessments with files, we expect at least some content
    const hasContent = 
      data.recap ||
      data.baseCharterParty ||
      data.riderClauses ||
      (data.additionalDocuments && data.additionalDocuments.length > 0);
    
    if (!hasContent) {
      return true;
    }
    
    // Special check for test_vessel - it should have all file types
    if (assessmentId === MOCK_ASSESSMENT_IDS.TEST_VESSEL) {
      if (!data.recap || !data.baseCharterParty || !data.riderClauses || 
          !data.additionalDocuments || data.additionalDocuments.length === 0) {
        return true;
      }
    }
    
    // Special check for baltic_ace - it only has a CP file
    if (assessmentId === MOCK_ASSESSMENT_IDS.BALTIC_ACE) {
      if (!data.baseCharterParty) {
        return true;
      }
    }
  }
  
  return false;
};

export const FileService = {
  // Save assessment files to localStorage with version
  saveAssessmentFiles: (assessmentId: string, files: AssessmentFiles): void => {
    try {
      const dataToStore: StoredAssessmentFiles = {
        ...files,
        _version: STORAGE_VERSION
      };
      localStorage.setItem(`${STORAGE_PREFIX}${assessmentId}`, JSON.stringify(dataToStore));
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error("Error saving assessment files:", error);
      }
    }
  },

  // Load assessment files from localStorage with validation and migration
  loadAssessmentFiles: (assessmentId: string): AssessmentFiles | null => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${assessmentId}`);
      if (data) {
        const parsed = JSON.parse(data) as StoredAssessmentFiles;
        
        // Ensure additionalDocuments is always an array
        if (!parsed.additionalDocuments) {
          parsed.additionalDocuments = [];
        }
        
        // Check if migration is needed
        if (needsMigration(parsed, assessmentId)) {
          localStorage.removeItem(`${STORAGE_PREFIX}${assessmentId}`);
          return null;
        }
        
        if (isValidAssessmentFiles(parsed)) {
          // Remove version before returning
          const { _version, ...files } = parsed;
          return files;
        } else {
          // Clear invalid data
          localStorage.removeItem(`${STORAGE_PREFIX}${assessmentId}`);
        }
      }
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error("Error loading assessment files:", error);
      }
      // Clear corrupted data
      localStorage.removeItem(`${STORAGE_PREFIX}${assessmentId}`);
    }
    return null;
  },

  // Load mock files for predefined assessments using file discovery
  loadMockFiles: async (assessmentId: string): Promise<AssessmentFiles | null> => {
    // Check if this assessment has mock files
    if (!ASSESSMENTS_WITH_FILES.includes(assessmentId)) {
      return null;
    }

    try {
      const discovered = await fileDiscoveryService.discoverAssessmentFiles(assessmentId);
      
      if (!discovered) {
        return null;
      }

      // Convert discovered files to AssessmentFiles format
      const assessmentFiles: AssessmentFiles = {
        recap: discovered.recap || '',
        baseCharterParty: discovered.baseCharterParty,
        riderClauses: discovered.riderClauses,
        additionalDocuments: discovered.additionalDocuments || []
      };

      return assessmentFiles;
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error(`Error loading mock files for ${assessmentId}:`, error);
      }
      return null;
    }
  },

  // Clear assessment files
  clearAssessmentFiles: (assessmentId: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${assessmentId}`);
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error("Error clearing assessment files:", error);
      }
    }
  }
}; 