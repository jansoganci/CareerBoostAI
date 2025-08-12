import { JobMatchService } from './ai/jobMatchService';
import { CoverLetterService } from './ai/coverLetterService';
import { ResumeOptimizerService } from './ai/resumeOptimizerService';
import { ChatMessage, MatchResult, CVData, JobDescription, UserProfile } from '../types';
import { ContactInfo } from '../components/ContactInfoInput';

export class GeminiService {
  private jobMatchService = new JobMatchService();
  private coverLetterService = new CoverLetterService();
  private resumeOptimizerService = new ResumeOptimizerService();
  
  private cvData: CVData | null = null;
  private jobDescription: JobDescription | null = null;
  private userProfile: UserProfile | null = null;

  async initializeChat(cvData: CVData, jobDescription: JobDescription, userProfile?: UserProfile) {
    this.cvData = cvData;
    this.jobDescription = jobDescription;
    this.userProfile = userProfile || null;

    // Initialize all services
    await this.jobMatchService.initializeChat(cvData, jobDescription, userProfile);
    await this.coverLetterService.initializeChat(cvData, jobDescription, userProfile);
    await this.resumeOptimizerService.initializeChat(cvData, jobDescription, userProfile);
  }

  async checkMatch(): Promise<MatchResult> {
    if (!this.cvData || !this.jobDescription) {
      throw new Error('CV and job description must be provided first');
    }

    return await this.jobMatchService.checkMatch();
  }

  async sendMessage(message: string, contactInfo?: ContactInfo): Promise<string> {
    if (!this.cvData || !this.jobDescription) {
      throw new Error('Chat not initialized. Please add profile, upload CV and job description first.');
    }

    // Check if user wants to generate cover letter
    if (message.toLowerCase().includes('cover letter') || 
        message.toLowerCase().includes('generate a cover letter') ||
        message.toLowerCase().includes('create cover letter') ||
        message.toLowerCase().includes('write cover letter')) {
      
      // Check if contact info is provided
      if (!contactInfo || !contactInfo.fullName || !contactInfo.email || !contactInfo.location) {
        return 'Please add your contact information first using the Contact Information section above.';
      }
      
      // Generate cover letter directly using provided contact info
      try {
        return await this.coverLetterService.generateCoverLetter(contactInfo);
      } catch (error) {
        console.error('Cover letter generation error:', error);
        return 'Sorry, I encountered an error while generating your cover letter. Please try again.';
      }
    }

    // Check if user wants to optimize resume
    if (message.toLowerCase().includes('optimize') && message.toLowerCase().includes('resume') || 
        message.toLowerCase().includes('optimize my resume') ||
        message.toLowerCase().includes('tailor resume') ||
        message.toLowerCase().includes('ats optimize')) {
      
      // Start resume optimization data collection
      this.resumeOptimizerService.startDataCollection();
      return `🎯 **Resume Optimizer Started!**

I'll help you create an ATS-optimized resume tailored specifically for this position! I need to collect a few details first.

**Step 1 of 3:**
What specific role title should I optimize for? (e.g., "Senior SAP Consultant", "Finance Manager")`;
    }

    // Handle resume optimization data collection
    if (this.resumeOptimizerService.isCollecting()) {
      return await this.resumeOptimizerService.handleDataCollection(message);
    }

    // Default to job match service for general questions
    return await this.jobMatchService.sendMessage(message);
  }

  reset() {
    this.jobMatchService.reset();
    this.coverLetterService.reset();
    this.resumeOptimizerService.reset();
    this.cvData = null;
    this.jobDescription = null;
    this.userProfile = null;
  }
}