import { model } from '../../config/gemini';
import { JOB_MATCH_SYSTEM_PROMPT } from './prompts/jobMatchPrompt';
import { MatchResult, CVData, JobDescription, UserProfile } from '../../types';

export class JobMatchService {
  private chat: any = null;

  async initializeChat(cvData: CVData, jobDescription: JobDescription, userProfile?: UserProfile) {
    const profileSection = userProfile ? `
CANDIDATE PROFILE:
${userProfile.content}
` : '';

    const initialContext = `${JOB_MATCH_SYSTEM_PROMPT}
${profileSection}

CV CONTENT:
${cvData.content}

JOB DESCRIPTION:
${jobDescription.content}

You now have the candidate's ${userProfile ? 'profile, ' : ''}CV and the job description. You can analyze them and provide match recommendations.`;

    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: initialContext }]
        },
        {
          role: 'model',
          parts: [{ text: 'I have analyzed the CV and job description. I\'m ready to provide a match recommendation.' }]
        }
      ]
    });
  }

  async checkMatch(): Promise<MatchResult> {
    if (!this.chat) {
      throw new Error('Chat not initialized. Please provide CV and job description first.');
    }

    try {
      const prompt = `Based on the CV and job description provided, should this candidate apply for this position? Give me a direct yes/no answer in the specified format.`;
      
      const result = await this.chat.sendMessage(prompt);
      const response = result.response.text();
      
      const isMatch = response.toLowerCase().includes('yes, you should apply');
      
      return {
        decision: isMatch ? 'yes' : 'no',
        message: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error checking match:', error);
      throw new Error('Failed to analyze job match');
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat) {
      throw new Error('Chat not initialized. Please provide CV and job description first.');
    }

    try {
      const result = await this.chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  reset() {
    this.chat = null;
  }
}