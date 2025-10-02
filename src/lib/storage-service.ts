import { STORAGE_KEYS, DEFAULTS } from '@/lib/constants';
import { Assessment } from '@/types/assessment';
import { TriageStatus } from '@/types/triage';
import { AnalysisItem } from '@/types/analysis';

const isServer = typeof window === 'undefined';

function generateStableId(
  item: AnalysisItem, 
  dataset: string
): string {
  // Create a unique string from the content
  const summary = 'risk_summary' in item ? item.risk_summary : ('summary' in item ? item.summary : (item as AnalysisItem).description);
  const uniqueContent = `${dataset}_${item.title}_${summary}`;
  
  // Simple hash function to generate a stable ID
  let hash = 0;
  for (let i = 0; i < uniqueContent.length; i++) {
    const char = uniqueContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base36 for shorter, alphanumeric string
  return Math.abs(hash).toString(36);
}

export const StorageService = {
  // Auth
  isLoggedIn: (): boolean => {
    if (isServer) return false;
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  },

  setLoggedIn: (value: boolean) => {
    if (isServer) return;
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, String(value));
  },

  getUsername: (): string => {
    if (isServer) return DEFAULTS.USERNAME;
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || DEFAULTS.USERNAME;
  },

  setUsername: (username: string) => {
    if (isServer) return;
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  },
  
  clearAuth: () => {
    if (isServer) return;
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
  },

  // Assessments
  getAssessments: (): Assessment[] => {
    if (isServer) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveAssessments: (assessments: Assessment[]) => {
    if (isServer) return;
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  },
  
  // Active View
  getActiveView: (): string | null => {
    if (isServer) return null;
    return sessionStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
  },
  
  setActiveView: (view: string) => {
    if (isServer) return;
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view);
  },
  
  clearActiveView: () => {
    if (isServer) return;
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_VIEW);
  },

  // Generic item getter/setter
  getItem: <T>(key: string): T | null => {
    if (isServer) return null;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : null;
  },

  setItem: <T>(key: string, value: T): void => {
    if (isServer) return;
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem: (key: string) => {
    if (isServer) return;
    localStorage.removeItem(key);
  },

  // Redraft content
  getRedraft: (key: string): string | null => {
    if (isServer) return null;
    return localStorage.getItem(key);
  },

  saveRedraft: (key: string, content: string) => {
    if (isServer) return;
    localStorage.setItem(key, content);
  },

  removeRedraft: (key: string) => {
    if (isServer) return;
    localStorage.removeItem(key);
  },

  // Triage status
  getTriageStatus: (username: string, assessmentId: string): Map<string, TriageStatus> => {
    if (isServer) return new Map();
    try {
      const key = `${username}_triage_status_${assessmentId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return new Map(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error parsing triage status from storage:", e);
    }
    return new Map();
  },

  saveTriageStatus: (username: string, assessmentId: string, map: Map<string, TriageStatus>) => {
    if (isServer) return;
    try {
      const key = `${username}_triage_status_${assessmentId}`;
      const array = Array.from(map.entries());
      localStorage.setItem(key, JSON.stringify(array));
    } catch (e) {
      console.error("Error saving triage status to storage:", e);
    }
  },

  setItemTriageStatus: (item: AnalysisItem, assessmentId: string, username: string, newStatus: TriageStatus): TriageStatus | null => {
    const itemId = generateStableId(item, assessmentId);
    const statusMap = StorageService.getTriageStatus(username, assessmentId);
    
    const currentStatus = statusMap.get(itemId);
  
    if (currentStatus === newStatus) {
      statusMap.delete(itemId);
      StorageService.saveTriageStatus(username, assessmentId, statusMap);
      return null;
    } else {
      statusMap.set(itemId, newStatus);
      StorageService.saveTriageStatus(username, assessmentId, statusMap);
      return newStatus;
    }
  },

  getItemTriageStatus: (item: AnalysisItem, assessmentId: string, username: string): TriageStatus | null => {
    const itemId = generateStableId(item, assessmentId);
    const statusMap = StorageService.getTriageStatus(username, assessmentId);
    return statusMap.get(itemId) || null;
  }
}; 