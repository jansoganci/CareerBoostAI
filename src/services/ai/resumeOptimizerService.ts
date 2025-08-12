import { model } from '../../config/gemini';
import { RESUME_OPTIMIZER_SYSTEM_PROMPT } from './prompts/resumeOptimizerPrompt';
import { CVData, JobDescription, UserProfile } from '../../types';
import { cleanDocumentContent } from '../../utils/textUtils';

export class ResumeOptimizerService {
  private chat: any = null;
  private cvData: CVData | null = null;
  private jobDescription: JobDescription | null = null;
  private userProfile: UserProfile | null = null;
  private resumeData: any = {};
  private isCollectingData = false;
  private currentStep = 0;
  
  private readonly steps = [
    { key: 'targetRole', question: 'What specific role title should I optimize for? (e.g., "Senior SAP Consultant", "Finance Manager")' },
    { key: 'experienceLevel', question: 'What experience level should I emphasize? (e.g., "Senior", "Lead", "Manager", "Specialist")' },
    { key: 'keyFocus', question: 'What should be the main focus? (e.g., "Technical expertise", "Leadership", "Analytics", "Automation")' }
  ];

  async initializeChat(cvData: CVData, jobDescription: JobDescription, userProfile?: UserProfile) {
    this.cvData = cvData;
    this.jobDescription = jobDescription;
    this.userProfile = userProfile || null;
    
    const profileSection = userProfile ? `
CANDIDATE PROFILE:
${userProfile.content}
` : '';

    const initialContext = `${RESUME_OPTIMIZER_SYSTEM_PROMPT}
${profileSection}

CV CONTENT:
${cvData.content}

JOB DESCRIPTION:
${jobDescription.content}

You now have the candidate's ${userProfile ? 'profile, ' : ''}CV and the job description. You can help create an ATS-optimized resume.`;

    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: initialContext }]
        },
        {
          role: 'model',
          parts: [{ text: `I have analyzed the candidate's ${userProfile ? 'profile, ' : ''}CV and job description. I\'m ready to help you create an ATS-optimized resume tailored for this position.` }]
        }
      ]
    });
  }

  startDataCollection(): string {
    this.isCollectingData = true;
    this.currentStep = 0;
    this.resumeData = {};
    
    return `🎯 **Resume Optimizer Started!**

I'll help you create an ATS-optimized resume tailored specifically for this position! I need to collect a few details first.

**Step 1 of ${this.steps.length}:**
${this.steps[0].question}`;
  }

  async handleDataCollection(message: string): Promise<string> {
    const currentStepData = this.steps[this.currentStep];
    this.resumeData[currentStepData.key] = message.trim();
    this.currentStep++;

    // If we have more steps, ask the next question
    if (this.currentStep < this.steps.length) {
      const nextStep = this.steps[this.currentStep];
      return `✅ Got it!

**Step ${this.currentStep + 1} of ${this.steps.length}:**
${nextStep.question}`;
    }

    // All data collected, generate the optimized resume
    this.isCollectingData = false;
    return await this.generateOptimizedResume();
  }

  private async generateOptimizedResume(): Promise<string> {
    if (!this.chat) {
      throw new Error('Chat not initialized');
    }

    try {
      const prompt = `Create a professional, ATS-optimized resume using these specifications:

TARGET SPECIFICATIONS:
- Target Role: ${this.resumeData.targetRole}
- Experience Level: ${this.resumeData.experienceLevel}
- Key Focus: ${this.resumeData.keyFocus}

CRITICAL WORK EXPERIENCE INSTRUCTIONS:
- MAINTAIN the EXACT chronological order of work experience as it appears in the original CV
- PRESERVE company names, job titles, employment dates, and locations EXACTLY as they appear in the original CV
- DO NOT reorder, rename, or change any company names, job titles, or dates
- ONLY optimize and improve the bullet points/achievements within each job entry

CRITICAL INSTRUCTIONS:
- Analyze the CV and job description provided earlier
- Keep all work experience entries in their original chronological order
- Preserve original company names, job titles, and dates exactly
- Only optimize the bullet points to highlight relevant achievements for the target role
- Use the exact structure specified in the system prompt
- Include quantified achievements with numbers/percentages
- Optimize bullet points to match job requirements while maintaining chronological order
- Keep total length under 500 words for 1-2 page output
- Use clean, professional language without any AI metadata
- Focus on achievements that demonstrate value and impact
- Ensure all content is ATS-compatible and scannable

Generate ONLY the resume content following the mandatory structure. No introductory text, no explanations, no AI responses - just the clean resume content ready for export.`;

      const result = await this.chat.sendMessage(prompt);
      let optimizedResume = result.response.text();
      
      // Clean the resume content using utility function
      optimizedResume = cleanDocumentContent(optimizedResume);
      
      // Reset the data collection state
      this.resumeData = {};
      
      return `✅ **Your ATS-optimized resume is ready:**

${optimizedResume}

---
🎉 **Professional resume generated!** Click the download buttons below to get PDF or DOCX versions.`;
      
    } catch (error) {
      this.isCollectingData = false;
      this.resumeData = {};
      throw error;
    }
  }

  isCollecting(): boolean {
    return this.isCollectingData;
  }

  reset() {
    this.chat = null;
    this.cvData = null;
    this.jobDescription = null;
    this.userProfile = null;
    this.resumeData = {};
    this.isCollectingData = false;
    this.currentStep = 0;
  }
}