export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MatchResult {
  decision: 'yes' | 'no';
  message: string;
  timestamp: Date;
}

export interface CVData {
  content: string;
  fileName?: string;
  uploadedAt: Date;
}

export interface JobDescription {
  content: string;
  jobTitle?: string;
  companyName?: string;
  addedAt: Date;
}

export interface UserProfile {
  content: string;
  savedAt: Date;
}