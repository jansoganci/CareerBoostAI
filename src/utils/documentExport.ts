import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { 
  cleanDocumentContent, 
  fixCharacterEncoding, 
  validateDocumentContent,
  extractJobInfo, 
  extractResumeInfo,
  formatProfessionalContent,
  extractSenderInfo,
  extractRecipientInfo,
  extractCoverLetterBody
} from './textUtils';

export interface DocumentData {
  content: string;
  jobTitle?: string;
  companyName?: string;
  candidateName?: string;
}

export const exportToPDF = async (data: DocumentData) => {
  const isResume = data.content.toLowerCase().includes('professional summary') || 
                  data.content.toLowerCase().includes('work experience') ||
                  data.content.toLowerCase().includes('technical skills');
  
  const documentType = isResume ? 'resume' : 'cover-letter';
  
  // Validate content quality before export
  if (!validateDocumentContent(data.content, documentType)) {
    throw new Error('Document content is not ready for export. Please ensure the content is complete and properly formatted.');
  }
  
  // Clean and process content with advanced text processing
  let cleanContent = formatProfessionalContent(data.content, documentType);
  
  // Create PDF with proper UTF-8 support
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });
  
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - (margin * 2);
  
  let yPosition = margin + 20;
  
  // Add document header
  if (isResume) {
    const { name, role } = extractResumeInfo(cleanContent);
    
    // Name as main header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const nameLines = pdf.splitTextToSize(name, maxWidth);
    nameLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 22;
    });
    
    yPosition += 10;
  } else {
    const { company, position } = extractJobInfo(data.content);
    
    // Cover Letter header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cover Letter', margin, yPosition);
    yPosition += 25;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const subtitle = `${position} at ${company}`;
    pdf.text(subtitle, margin, yPosition);
    yPosition += 30;
  }
  
  // Process content line by line with proper formatting
  const contentLines = cleanContent.split('\n').filter(line => line.trim());
  
  contentLines.forEach((line: string, index: number) => {
    if (line.trim() === '') return;
    
    // Apply character encoding fixes before processing
    line = fixCharacterEncoding(line);
    
    // Additional specific pattern fixes for common issues
    line = line.replace(/S\s+a\s+b\s+a\s+n\s+c\s*[1ı]\s*Ü\s+n\s+i\s+v\s+e\s+r\s+s\s+i\s+t\s+e\s+s\s+i/gi, 'University Name');
    line = line.replace(/M\s+e\s+r\s+c\s+e\s+d\s+e\s+s\s*-\s*B\s+e\s+n\s+z\s+T\s*[üu]\s*r\s*k/gi, 'Company Name');
    
    // Detect different types of content
    const isHeader = /^[A-Z\s&]{3,}$/.test(line.trim()) && !line.includes('@');
    const isName = index === 0 && /^[A-Z][a-zA-Z\s]+$/.test(line.trim()) && !line.includes('@');
    const isContact = line.includes('@') || line.includes('linkedin') || line.includes('|');
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const isCompanyName = /^[A-Z][a-zA-Z\s&]+$/.test(line.trim()) && line.length < 50 && !isHeader;
    const isJobTitle = line.includes('Consultant') || line.includes('Manager') || line.includes('Analyst');
    const isDate = line.includes('2020') || line.includes('2021') || line.includes('2022') || line.includes('2023') || line.includes('2024') || line.includes('2025');
    const isCertificationHeader = line.trim() === 'CERTIFICATIONS';
    
    // Skip name if already processed in header
    if (isName && isResume) return;
    
    // Set appropriate formatting
    if (isContact) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition += 5;
    } else if (isCertificationHeader) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      yPosition += 10;
    } else if (isHeader) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition += 15;
    } else if (isCompanyName && !isHeader) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      yPosition += 10;
    } else if (isJobTitle) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
    } else if (isDate) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
    } else if (isBullet) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
    } else {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
    }
    
    // Handle page breaks
    if (yPosition > pageHeight - margin - 50) {
      pdf.addPage();
      yPosition = margin + 20;
    }
    
    // Split long lines and add proper indentation
    const indent = isBullet ? margin + 15 : margin;
    const lineMaxWidth = isBullet ? maxWidth - 15 : maxWidth;
    
    try {
      const wrappedLines = pdf.splitTextToSize(line, lineMaxWidth);
      
      wrappedLines.forEach((wrappedLine: string, lineIndex: number) => {
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage();
          yPosition = margin + 20;
        }
        
        pdf.text(wrappedLine, indent, yPosition);
        yPosition += isHeader ? 16 : isBullet ? 14 : 12;
      });
      
      // Add extra spacing after sections
      if (isHeader) yPosition += 5;
      if (isCompanyName) yPosition += 3;
      
    } catch (error) {
      console.warn('Error processing line:', line, error);
      // Fallback: add line as-is
      pdf.text(line.substring(0, 100), indent, yPosition);
      yPosition += 12;
    }
  });
  
  // Generate filename
  let fileName;
  if (isResume) {
    const { name, role } = extractResumeInfo(cleanContent);
    fileName = `${name.replace(/\s+/g, '_')}_${role.replace(/\s+/g, '_')}_Resume.pdf`;
  } else {
    // Use provided job title and company name, fallback to extraction
    const company = data.companyName || extractJobInfo(data.content).company;
    const position = data.jobTitle || extractJobInfo(data.content).position;
    fileName = `Cover_Letter_${company.replace(/\s+/g, '_')}_${position.replace(/\s+/g, '_')}.pdf`;
  }
  
  // Enhanced cover letter formatting
  if (!isResume) {
    // Clear the PDF and start fresh with proper cover letter layout
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    pdf.setFont('helvetica');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 60; // Increased margin for professional look
    const maxWidth = pageWidth - (margin * 2);
    
    let yPosition = margin + 30;
    
    // Extract sender info and format properly
    const senderInfo = extractSenderInfo(cleanContent);
    
    // Use provided job title and company name, fallback to extraction
    const company = data.companyName || extractJobInfo(data.content).company;
    const position = data.jobTitle || extractJobInfo(data.content).position;
    
    const recipientInfo = extractRecipientInfo(cleanContent);
    
    // Sender's contact information (top right)
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const contactInfo = [
      senderInfo.name,
      senderInfo.email || 'your.email@example.com',
      senderInfo.location || 'Your City, Your Country'
    ];
    
    contactInfo.forEach(info => {
      pdf.text(info, margin, yPosition);
      yPosition += 14;
    });
    
    yPosition += 15;
    
    // Date
    pdf.setFontSize(11);
    const dateMatch = cleanContent.match(/(\w+ \d{1,2}, \d{4})/);
    const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(date, margin, yPosition);
    yPosition += 25;
    
    // Recipient information
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(company, margin, yPosition);
    yPosition += 14;
    
    yPosition += 20;
    
    // Subject line
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Re: Application for ${position}`, margin, yPosition);
    yPosition += 20;
    
    // Salutation
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const greeting = recipientInfo.name ? `Dear ${recipientInfo.name},` : 'Dear Hiring Manager,';
    pdf.text(greeting, margin, yPosition);
    yPosition += 18;
    
    // Body paragraphs with proper spacing
    const bodyContent = extractCoverLetterBody(cleanContent);
    const paragraphs = bodyContent.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach((paragraph, index) => {
      if (yPosition > pageHeight - margin - 100) {
        pdf.addPage();
        yPosition = margin + 30;
      }
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const lines = pdf.splitTextToSize(paragraph.trim(), maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage();
          yPosition = margin + 30;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 14;
      });
      
      yPosition += 12; // Reduced paragraph spacing
    });
    
    // Closing
    yPosition += 8;
    pdf.text('Sincerely,', margin, yPosition);
    yPosition += 30; // Reduced signature space
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(senderInfo.name, margin, yPosition);
    
    pdf.save(fileName);
    return;
  }
  
  pdf.save(fileName);
};

export const exportToDocx = async (data: DocumentData) => {
  const isResume = data.content.toLowerCase().includes('professional summary') || 
                  data.content.toLowerCase().includes('work experience') ||
                  data.content.toLowerCase().includes('technical skills');
  
  const documentType = isResume ? 'resume' : 'cover-letter';
  
  // Validate content quality
  if (!validateDocumentContent(data.content, documentType)) {
    throw new Error('Document content is not ready for export. Please ensure the content is complete and properly formatted.');
  }
  
  // Clean and process content
  let cleanContent = formatProfessionalContent(data.content, documentType);
  
  // Split content into paragraphs
  const lines = cleanContent.split('\n').filter(line => line.trim());
  
  let fileName;
  if (isResume) {
    const { name, role } = extractResumeInfo(cleanContent);
    fileName = `${name.replace(/\s+/g, '_')}_${role.replace(/\s+/g, '_')}_Resume.docx`;
  } else {
    // Use provided job title and company name, fallback to extraction
    const company = data.companyName || extractJobInfo(data.content).company;
    const position = data.jobTitle || extractJobInfo(data.content).position;
    fileName = `Cover_Letter_${company.replace(/\s+/g, '_')}_${position.replace(/\s+/g, '_')}.docx`;
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Process each line with appropriate formatting
        ...lines.map((line, index) => {
          // Apply character encoding fixes
          line = fixCharacterEncoding(line);
          
          const isHeader = /^[A-Z\s&]{3,}$/.test(line.trim()) && !line.includes('@');
          const isName = index === 0 && /^[A-Z][a-zA-Z\s]+$/.test(line.trim()) && !line.includes('@');
          const isContact = line.includes('@') || line.includes('linkedin') || line.includes('|');
          const isBullet = line.trim().startsWith('•');
          const isCertificationHeader = line.trim() === 'CERTIFICATIONS';
          
          if (isName && isResume) {
            return new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            });
          } else if (isContact) {
            return new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            });
          } else if (isCertificationHeader) {
            return new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 150 },
            });
          } else if (isHeader) {
            return new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 300, after: 200 },
            });
          } else {
            return new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  size: 20,
                }),
              ],
              spacing: { after: isBullet ? 100 : 150 },
            });
          }
        }),
      ],
    }],
  });
  
  // Generate and save the document
  const buffer = await Packer.toBuffer(doc);
  saveAs(new Blob([buffer]), fileName);
};