import { model } from '../../config/gemini';
import { COVER_LETTER_SYSTEM_PROMPT } from './prompts/coverLetterPrompt';
import { CVData, JobDescription, UserProfile } from '../../types';
import { ContactInfo } from '../components/ContactInfoInput';
import { formatCompleteCoverLetter } from '../../utils/textUtils';

export class CoverLetterService {
  private chat: any = null;
  private cvData: CVData | null = null;
  private jobDescription: JobDescription | null = null;
  private userProfile: UserProfile | null = null;

  async initializeChat(cvData: CVData, jobDescription: JobDescription, userProfile?: UserProfile) {
    this.cvData = cvData;
    this.jobDescription = jobDescription;
    this.userProfile = userProfile || null;
    
    const profileSection = userProfile ? `
CANDIDATE PROFILE:
${userProfile.content}
` : '';

    const initialContext = `${COVER_LETTER_SYSTEM_PROMPT}
${profileSection}

CV CONTENT:
${cvData.content}

JOB DESCRIPTION:
${jobDescription.content}

You now have the candidate's ${userProfile ? 'profile, ' : ''}CV and the job description. You can help create a personalized cover letter.`;

    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: initialContext }]
        },
        {
          role: 'model',
          parts: [{ text: `I have analyzed the candidate's ${userProfile ? 'profile, ' : ''}CV and job description. I\'m ready to help you create a personalized cover letter for this position.` }]
        }
      ]
    });
  }

  async generateCoverLetter(contactInfo: ContactInfo): Promise<string> {
    if (!this.chat) {
      throw new Error('Cover letter service not initialized. Please try again.');
    }

    // Debug: Log contact info received in service
    console.log('CoverLetterService - Received contact info:', contactInfo);

    try {
      const prompt = `Generate a professional cover letter with the following information:

CONTACT INFORMATION:
- Name: ${contactInfo.fullName}
- Email: ${contactInfo.email}
- Phone: ${contactInfo.phone || 'Not provided'}
- Location: ${contactInfo.location}
- Professional Title: ${contactInfo.professionalTitle}
- LinkedIn: ${contactInfo.linkedin || 'Not provided'}
- Portfolio: ${contactInfo.portfolio || 'Not provided'}

INSTRUCTIONS:
- Extract company name and role from the job description provided earlier
- Write a compelling cover letter focusing on content quality
- Use professional business letter structure
- Include specific achievements and quantified results
- Match the tone to the company culture
- Keep paragraphs concise and impactful

Generate ONLY the cover letter content - no additional text or formatting instructions.`;
      
      const result = await this.chat.sendMessage(prompt);
      const rawCoverLetter = result.response.text();
      
      if (!rawCoverLetter || rawCoverLetter.trim().length < 50) {
        throw new Error('Generated cover letter is too short. Please try again.');
      }
      
      // Apply professional formatting using our utility functions
      const formattedCoverLetter = formatCompleteCoverLetter(rawCoverLetter, contactInfo);
      
      return `✅ **Perfect! Here's your personalized cover letter:**

${formattedCoverLetter}

---
🎉 **Your cover letter is ready!** Click the download buttons below to get PDF or DOCX versions.`;
      
    } catch (error) {
      console.error('Cover letter generation error:', error);
      throw error;
    }
  }

  reset() {
    this.chat = null;
    this.cvData = null;
    this.jobDescription = null;
    this.userProfile = null;
  }
}