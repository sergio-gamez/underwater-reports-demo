import { FileMetadata } from "@/components/views/files-view";
import { ACCEPTED_FILE_TYPES, IS_DEVELOPMENT } from "@/lib/constants";

export interface DiscoveredFiles {
  recap?: string;
  recapFilename?: string;
  baseCharterParty?: FileMetadata;
  riderClauses?: FileMetadata;
  additionalDocuments: FileMetadata[];
}

export interface AssessmentManifest {
  recap?: string;
  baseCharterParty?: string;
  riderClauses?: string;
  additionalDocuments?: string[];
}

type FileCategory = 'recap' | 'charter_party' | 'rider' | 'additional' | 'unknown';

// Configuration constants
const MAX_ADDITIONAL_FILES_AUTO_DISCOVERY = 3;
const SUPPORTED_DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx'];
const MANIFEST_FILENAME = 'manifest.json';

// Cache for manifest data
const manifestCache = new Map<string, { data: AssessmentManifest | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class FileDiscoveryService {
  private static readonly FILE_PATTERNS = {
    recap: /_recap\.txt$/i,
    charter_party: /_cp\.(pdf|doc|docx)$/i,
    rider: /_rider\.(pdf|doc|docx)$/i,
    additional: /_additional_\d+\.(pdf|doc|docx)$/i,
  };

  /**
   * Validates manifest structure
   */
  private isValidManifest(data: any): data is AssessmentManifest {
    if (!data || typeof data !== 'object') return false;
    
    // Validate each field if present
    if (data.recap !== undefined && typeof data.recap !== 'string') return false;
    if (data.baseCharterParty !== undefined && typeof data.baseCharterParty !== 'string') return false;
    if (data.riderClauses !== undefined && typeof data.riderClauses !== 'string') return false;
    
    if (data.additionalDocuments !== undefined) {
      if (!Array.isArray(data.additionalDocuments)) return false;
      if (!data.additionalDocuments.every((item: any) => typeof item === 'string')) return false;
    }
    
    return true;
  }

  /**
   * Sanitizes filename to prevent directory traversal
   */
  private sanitizeFilename(filename: string): string {
    // Remove any path separators and parent directory references
    return filename.replace(/[\/\\]/g, '').replace(/\.\./g, '');
  }

  /**
   * Discovers all files for an assessment, using manifest if available
   */
  async discoverAssessmentFiles(assessmentId: string): Promise<DiscoveredFiles | null> {
    try {
      // Check cache first
      const cached = manifestCache.get(assessmentId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.data) {
        return this.discoverFromManifest(assessmentId, cached.data);
      }

      // Try to load manifest
      const manifestUrl = `/assessment-files/${assessmentId}/${MANIFEST_FILENAME}`;
      const manifestResponse = await fetch(manifestUrl);
      
      if (manifestResponse.ok) {
        try {
          const manifestData = await manifestResponse.json();
          
          // Validate manifest structure
          if (!this.isValidManifest(manifestData)) {
            if (IS_DEVELOPMENT) {
              console.error(`Invalid manifest structure for ${assessmentId}`);
            }
            return this.discoverByConvention(assessmentId);
          }
          
          // Cache the manifest
          manifestCache.set(assessmentId, { data: manifestData, timestamp: Date.now() });
          
          return this.discoverFromManifest(assessmentId, manifestData);
        } catch (error) {
          if (IS_DEVELOPMENT) {
            console.error(`Error parsing manifest for ${assessmentId}:`, error);
          }
          return this.discoverByConvention(assessmentId);
        }
      } else {
        // Cache the absence of manifest
        manifestCache.set(assessmentId, { data: null, timestamp: Date.now() });
        return this.discoverByConvention(assessmentId);
      }
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error(`Error discovering files for ${assessmentId}:`, error);
      }
      return null;
    }
  }

  /**
   * Discover files using manifest
   */
  private async discoverFromManifest(
    assessmentId: string, 
    manifest: AssessmentManifest
  ): Promise<DiscoveredFiles | null> {
    const discovered: DiscoveredFiles = {
      additionalDocuments: []
    };

    // Load recap if specified
    if (manifest.recap) {
      const sanitizedFilename = this.sanitizeFilename(manifest.recap);
      const recapContent = await this.fetchRecapContent(assessmentId, sanitizedFilename);
      if (recapContent !== null) {
        discovered.recap = recapContent;
        discovered.recapFilename = sanitizedFilename;
      }
    }

    // Load base charter party if specified
    if (manifest.baseCharterParty) {
      const sanitizedFilename = this.sanitizeFilename(manifest.baseCharterParty);
      const file = await this.verifyAndCreateFileMetadata(assessmentId, sanitizedFilename);
      if (file) {
        discovered.baseCharterParty = file;
      }
    }

    // Load rider clauses if specified
    if (manifest.riderClauses) {
      const sanitizedFilename = this.sanitizeFilename(manifest.riderClauses);
      const file = await this.verifyAndCreateFileMetadata(assessmentId, sanitizedFilename);
      if (file) {
        discovered.riderClauses = file;
      }
    }

    // Load additional documents if specified
    if (manifest.additionalDocuments && Array.isArray(manifest.additionalDocuments)) {
      for (const filename of manifest.additionalDocuments) {
        const sanitizedFilename = this.sanitizeFilename(filename);
        const file = await this.verifyAndCreateFileMetadata(assessmentId, sanitizedFilename);
        if (file) {
          discovered.additionalDocuments.push(file);
        }
      }
    }

    // Return discovered files if any were found
    const hasAnyFiles = discovered.recap || 
                       discovered.baseCharterParty || 
                       discovered.riderClauses || 
                       discovered.additionalDocuments.length > 0;

    return hasAnyFiles ? discovered : null;
  }

  /**
   * Verify file exists and create metadata (for manifest-based discovery)
   */
  private async verifyAndCreateFileMetadata(
    assessmentId: string,
    filename: string
  ): Promise<FileMetadata | null> {
    const url = `/assessment-files/${assessmentId}/${filename}`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        const extension = filename.split('.').pop() || '';
        return this.createFileMetadata(filename, extension);
      }
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error(`Error verifying file ${filename}:`, error);
      }
    }
    
    return null;
  }

  /**
   * Discover files by naming convention (fallback)
   */
  private async discoverByConvention(assessmentId: string): Promise<DiscoveredFiles | null> {
    const discovered: DiscoveredFiles = {
      additionalDocuments: []
    };

    // Try to load recap (but don't fail if it doesn't exist)
    const recapFilename = `${assessmentId}_recap.txt`;
    const recapContent = await this.fetchRecapContent(assessmentId, recapFilename);
    if (recapContent !== null) {
      discovered.recap = recapContent;
      discovered.recapFilename = recapFilename;
    }

    // Try to load base charter party
    const cpFile = await this.tryLoadFile(assessmentId, `${assessmentId}_cp`, SUPPORTED_DOCUMENT_EXTENSIONS);
    if (cpFile) {
      discovered.baseCharterParty = cpFile;
    }

    // Try to load rider clauses
    const riderFile = await this.tryLoadFile(assessmentId, `${assessmentId}_rider`, SUPPORTED_DOCUMENT_EXTENSIONS);
    if (riderFile) {
      discovered.riderClauses = riderFile;
    }

    // Try to load additional documents
    for (let i = 1; i <= MAX_ADDITIONAL_FILES_AUTO_DISCOVERY; i++) {
      const additionalFile = await this.tryLoadFile(
        assessmentId, 
        `${assessmentId}_additional_${i}`, 
        SUPPORTED_DOCUMENT_EXTENSIONS
      );
      if (additionalFile) {
        discovered.additionalDocuments.push(additionalFile);
      } else {
        // Stop looking for more if we hit a gap
        break;
      }
    }

    // Only return null if we found absolutely no files
    const hasAnyFiles = discovered.recap || 
                       discovered.baseCharterParty || 
                       discovered.riderClauses || 
                       discovered.additionalDocuments.length > 0;

    return hasAnyFiles ? discovered : null;
  }

  /**
   * Try to load a file with different extensions
   */
  private async tryLoadFile(
    assessmentId: string, 
    baseFilename: string, 
    extensions: string[]
  ): Promise<FileMetadata | null> {
    for (const ext of extensions) {
      const filename = `${baseFilename}.${ext}`;
      const url = `/assessment-files/${assessmentId}/${filename}`;
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          // File exists, create metadata
          return this.createFileMetadata(filename, ext);
        }
      } catch (error) {
        // Continue to next extension
      }
    }
    
    return null;
  }

  /**
   * Fetch and read recap content
   */
  private async fetchRecapContent(assessmentId: string, filename: string): Promise<string | null> {
    try {
      const response = await fetch(`/assessment-files/${assessmentId}/${filename}`);
      if (response.ok) {
        const text = await response.text();
        return text.trim();
      }
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error(`Error fetching recap for ${assessmentId}:`, error);
      }
    }
    return null;
  }

  /**
   * Create file metadata from discovered file
   */
  private createFileMetadata(filename: string, extension: string): FileMetadata {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain'
    };

    return {
      name: filename,
      size: 1024 * 500, // Mock 500KB for now
      type: mimeTypes[extension] || 'application/octet-stream',
      lastModified: Date.now()
    };
  }

  /**
   * Get file category based on filename pattern
   */
  private getFileCategory(filename: string): FileCategory {
    if (FileDiscoveryService.FILE_PATTERNS.recap.test(filename)) {
      return 'recap';
    }
    if (FileDiscoveryService.FILE_PATTERNS.charter_party.test(filename)) {
      return 'charter_party';
    }
    if (FileDiscoveryService.FILE_PATTERNS.rider.test(filename)) {
      return 'rider';
    }
    if (FileDiscoveryService.FILE_PATTERNS.additional.test(filename)) {
      return 'additional';
    }
    return 'unknown';
  }

  /**
   * Clear manifest cache (useful for testing)
   */
  clearCache(assessmentId?: string): void {
    if (assessmentId) {
      manifestCache.delete(assessmentId);
    } else {
      manifestCache.clear();
    }
  }
}

// Export singleton instance
export const fileDiscoveryService = new FileDiscoveryService(); 