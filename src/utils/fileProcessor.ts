import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { fixCharacterEncoding } from './textUtils';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    // Apply character encoding fixes immediately after extraction
    const cleanText = fixCharacterEncoding(fullText.trim());
    return cleanText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};

export const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    // Apply character encoding fixes immediately after extraction
    const cleanText = fixCharacterEncoding(result.value.trim());
    return cleanText;
  } catch (error) {
    console.error('Error extracting Word text:', error);
    throw new Error('Failed to extract text from Word file');
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  
  if (fileType.includes('pdf')) {
    return extractTextFromPDF(file);
  } else if (fileType.includes('word') || fileType.includes('document') || file.name.endsWith('.docx')) {
    return extractTextFromWord(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or Word files.');
  }
};