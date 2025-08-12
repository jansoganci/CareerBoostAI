import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

export const genAI = new GoogleGenerativeAI(API_KEY || '');
export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });