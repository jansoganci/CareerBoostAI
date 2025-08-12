export const STORAGE_KEYS = {
  CV_DATA: 'cv_data',
  CV_TEXT: 'userCvText', // Added for FileUpload component localStorage
  JOB_DESCRIPTION: 'job_description',
  USER_PROFILE: 'user_profile',
  CONTACT_INFO: 'contact_info'
} as const;

// Type definitions for better type safety
export interface StoredProfile {
  content: string;
  savedAt: string; // ISO string format for localStorage compatibility
}

export interface StoredCVData {
  content: string;
  fileName?: string;
  uploadedAt: string; // ISO string format for localStorage compatibility
}

export interface StoredJobDescription {
  content: string;
  title?: string;
  company?: string;
  addedAt: string; // ISO string format for localStorage compatibility
}

export interface StoredContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalTitle: string;
  linkedin: string;
  portfolio: string;
  savedAt: string; // ISO string format for localStorage compatibility
}

export const saveToStorage = (key: string, data: any) => {
  try {
    // Handle Date objects by converting to ISO strings
    const processedData = processDataForStorage(data);
    localStorage.setItem(key, JSON.stringify(processedData));
  } catch (error) {
    console.warn(`Failed to save to localStorage (key: ${key}):`, error);
    // Handle quota exceeded error specifically
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please clear some browser data and try again.');
    }
    throw new Error('Failed to save data to browser storage.');
  }
};

export const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsedData = JSON.parse(data);
    // Handle Date reconstruction for known data types
    return processDataFromStorage(parsedData, key);
  } catch (error) {
    console.warn(`Failed to load from localStorage (key: ${key}):`, error);
    // Return null for corrupted data instead of throwing
    return null;
  }
};

export const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove from localStorage (key: ${key}):`, error);
  }
};

// Helper function to process data before storing (handle Date objects)
const processDataForStorage = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(processDataForStorage);
  }
  
  if (typeof data === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        processed[key] = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        processed[key] = processDataForStorage(value);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  }
  
  return data;
};

// Helper function to reconstruct data after loading (handle Date strings)
const processDataFromStorage = (data: any, storageKey: string): any => {
  if (data === null || data === undefined) return data;
  
  // Handle known data structures with date fields
  if (typeof data === 'object' && !Array.isArray(data)) {
    const processed = { ...data };
    
    // Reconstruct Date objects based on storage key
    switch (storageKey) {
      case STORAGE_KEYS.USER_PROFILE:
        if (processed.savedAt && typeof processed.savedAt === 'string') {
          processed.savedAt = new Date(processed.savedAt);
        }
        break;
        
      case STORAGE_KEYS.CV_DATA:
        if (processed.uploadedAt && typeof processed.uploadedAt === 'string') {
          processed.uploadedAt = new Date(processed.uploadedAt);
        }
        break;
        
      case STORAGE_KEYS.JOB_DESCRIPTION:
        if (processed.addedAt && typeof processed.addedAt === 'string') {
          processed.addedAt = new Date(processed.addedAt);
        }
        break;
        
      case STORAGE_KEYS.CONTACT_INFO:
        if (processed.savedAt && typeof processed.savedAt === 'string') {
          processed.savedAt = new Date(processed.savedAt);
        }
        break;
    }
    
    return processed;
  }
  
  return data;
};

// Utility function to check localStorage availability and quota
export const checkStorageAvailability = (): { available: boolean; quota?: number; used?: number } => {
  try {
    // Test if localStorage is available
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Try to get storage quota information (if supported)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        console.log('Storage quota:', estimate.quota);
        console.log('Storage used:', estimate.usage);
      });
    }
    
    return { available: true };
  } catch (error) {
    console.warn('localStorage not available:', error);
    return { available: false };
  }
};

// Utility function to clear all app-related storage
export const clearAllAppStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeFromStorage(key);
    });
    console.log('All app storage cleared successfully');
  } catch (error) {
    console.warn('Failed to clear all app storage:', error);
  }
};