// Advanced text processing utilities for professional document generation

export const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/#{1,6}\s/g, '')        // Headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/`([^`]+)`/g, '$1')     // Code
    .trim();
};

export const cleanDocumentContent = (content: string): string => {
  return content
    // Remove AI response artifacts and system messages
    .replace(/^.*?Perfect!.*?cover letter.*?:/i, '')
    .replace(/^.*?Your.*?(?:cover letter|resume).*?is ready.*?$/gm, '')
    .replace(/^.*?Click the download buttons.*?$/gm, '')
    .replace(/^.*?Professional resume generated.*?$/gm, '')
    .replace(/^.*?Your ATS-optimized resume is ready.*?$/gm, '')
    .replace(/^.*?✅.*?$/gm, '')
    .replace(/^.*?🎉.*?$/gm, '')
    .replace(/^.*?📝.*?$/gm, '')
    .replace(/^.*?🎯.*?$/gm, '')
    
    // Remove markdown and formatting artifacts
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/---+/g, '')
    .replace(/^\s*[-*+]\s/gm, '• ') // Convert markdown bullets to proper bullets
    
    // Clean up spacing and structure
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/gm, '')
    .replace(/\s+$/gm, '')
    .trim();
};

export const fixCharacterEncoding = (text: string): string => {
  // Fix common Turkish character encoding issues
  const encodingFixes = {
    // Fix other spaced patterns that might occur
    'I s t a n b u l ,   T ü r k i y e': 'Istanbul, Turkey',
    'I s t a n b u l ,   T u r k e y': 'Istanbul, Turkey',
    
    // Fix broken encoding characters
    'Ã¼': 'ü',
    'Ã¶': 'ö', 
    'Ã§': 'ç',
    'Ä±': 'ı',
    'Ä°': 'İ',
    'Åž': 'ş',
    'Ä': 'ğ',
    'Ã': 'ü',
    
    // Fix specific broken text patterns
    'T�rk': 'Türk',
    'T�rkiye': 'Türkiye',
    
    // Country name updates - use official name
    'Turkey': 'Turkey',
    'Istanbul, Turkey': 'Istanbul, Turkey',
    
    '�': '', // Remove replacement characters
    '': '' // Remove any remaining replacement characters
  };

  let fixedText = text;
  Object.entries(encodingFixes).forEach(([broken, fixed]) => {
    fixedText = fixedText.replace(new RegExp(broken, 'g'), fixed);
  });

  return fixedText;
};

export const validateDocumentContent = (content: string, type: 'resume' | 'cover-letter'): boolean => {
  const cleanContent = cleanDocumentContent(content);
  
  if (type === 'resume') {
    // Resume should have key sections and be substantial
    const hasRequiredSections = cleanContent.toLowerCase().includes('professional summary') ||
                               cleanContent.toLowerCase().includes('work experience') ||
                               cleanContent.toLowerCase().includes('technical skills');
    const isSubstantial = cleanContent.length > 300;
    const noArtifacts = !cleanContent.includes('✅') && !cleanContent.includes('🎉');
    
    return hasRequiredSections && isSubstantial && noArtifacts;
  } else {
    // Cover letter should have proper structure
    const hasGreeting = cleanContent.toLowerCase().includes('dear');
    const hasClosing = cleanContent.toLowerCase().includes('sincerely');
    const isSubstantial = cleanContent.length > 200;
    const noArtifacts = !cleanContent.includes('✅') && !cleanContent.includes('🎉');
    
    return hasGreeting && hasClosing && isSubstantial && noArtifacts;
  }
};

export const extractJobInfo = (content: string) => {
  const companyMatch = content.match(/Dear\s+(.+?)\s+Hiring\s+Manager/i) || 
                      content.match(/at\s+([A-Z][a-zA-Z\s&]+?)(?:\s+for|\s+as|\.|,)/);
  const positionMatch = content.match(/for\s+the\s+(.+?)\s+position/i) ||
                       content.match(/applying\s+for\s+(.+?)\s+role/i);
  
  return {
    company: fixCharacterEncoding(companyMatch?.[1]?.trim() || 'Company'),
    position: positionMatch?.[1]?.trim() || 'Position'
  };
};

export const extractResumeInfo = (content: string) => {
  // Extract name from first line or contact section
  const lines = content.split('\n').filter(line => line.trim()).map(line => fixCharacterEncoding(line));
  const nameMatch = lines[0]?.match(/^([A-Z][a-zA-Z\s]+)$/) ||
                   content.match(/^([A-Z][a-zA-Z\s]+)\s*$/m);
  
  // Extract role from professional summary or job titles
  const roleMatch = content.match(/(?:PROFESSIONAL SUMMARY|Professional Summary)[\s\S]*?([A-Z][a-zA-Z\s]*(?:Consultant|Manager|Analyst|Specialist|Developer|Engineer|Director|Lead|Expert))/i) ||
                   content.match(/([A-Z][a-zA-Z\s]*(?:SAP|BPC|Finance|Financial|Senior|Lead)[\s\w]*(?:Consultant|Manager|Analyst|Specialist))/i);
  
  return {
    name: fixCharacterEncoding(nameMatch?.[1]?.trim() || 'Professional'),
    role: roleMatch?.[1]?.trim() || 'Resume'
  };
}

export const formatProfessionalContent = (content: string, type: 'resume' | 'cover-letter'): string => {
  let formatted = cleanDocumentContent(content);
  formatted = fixCharacterEncoding(formatted);
  
  if (type === 'resume') {
    // Ensure proper resume structure
    formatted = formatted
      .replace(/PROFESSIONAL SUMMARY/g, 'PROFESSIONAL SUMMARY')
      .replace(/TECHNICAL SKILLS/g, 'TECHNICAL SKILLS')
      .replace(/WORK EXPERIENCE/g, 'WORK EXPERIENCE')
      .replace(/EDUCATION & CERTIFICATIONS/g, 'EDUCATION & CERTIFICATIONS');
  }
  
  return formatted;
};

export const extractSenderInfo = (content: string) => {
  // Extract sender information from cover letter
  const nameMatch = content.match(/Sincerely,\s*([A-Z][a-zA-Z\s]+)/i) ||
                   content.match(/^([A-Z][a-zA-Z\s]+)\s*$/m);
  
  const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = content.match(/(\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9})/);
  
  // Extract location from pipe-delimited contact line format: email | phone | location
  let location = null;
  
  // Look for pipe-delimited contact lines with exactly 3 segments
  const contactLineMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s*\|\s*([^|]*?)\s*\|\s*([^|\n]+)/);
  if (contactLineMatch && contactLineMatch[3]) {
    // Third segment after email and phone should be location
    location = contactLineMatch[3].trim();
  }
  
  // If no pipe-delimited format found, fallback to pattern matching
  if (!location) {
    const locationPatterns = [
      // City, Country format
      /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)/g,
      // Single location names that are not generic words
      /(Bangkok|Istanbul|Singapore|London|New York|Tokyo|Berlin|Paris|Sydney|Toronto|Dubai|Mumbai|Delhi|Shanghai|Seoul|Manila|Jakarta|Kuala Lumpur|Ho Chi Minh City|Hanoi|Yangon|Phnom Penh|Vientiane|Bandar Seri Begawan|Male|Colombo|Kathmandu|Thimphu|Dhaka|Islamabad|Kabul|Tehran|Baghdad|Damascus|Beirut|Amman|Jerusalem|Cairo|Tripoli|Tunis|Algiers|Rabat|Casablanca|Lagos|Nairobi|Cape Town|Johannesburg|Addis Ababa|Khartoum|Accra|Abuja|Dakar|Bamako|Ouagadougou|Niamey|N'Djamena|Bangui|Kinshasa|Brazzaville|Libreville|Malabo|Sao Tome|Luanda|Windhoek|Gaborone|Maseru|Mbabane|Maputo|Antananarivo|Port Louis|Victoria|Moroni)/gi
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match && match[0]) {
        location = match[0];
        break;
      }
    }
  }
  
  return {
    name: fixCharacterEncoding(nameMatch?.[1]?.trim() || 'Your Name'),
    email: emailMatch?.[1] || null,
    phone: phoneMatch?.[1] || null,
    location: location ? fixCharacterEncoding(location) : null
  };
};

export const extractRecipientInfo = (content: string) => {
  // Extract recipient information
  const nameMatch = content.match(/Dear\s+([A-Z][a-zA-Z\s]+),/i);
  const companyMatch = content.match(/at\s+([A-Z][a-zA-Z\s&]+?)(?:\s+for|\s+as|\.|,)/);
  
  return {
    name: nameMatch?.[1]?.trim() !== 'Hiring Manager' ? nameMatch?.[1]?.trim() : null,
    company: fixCharacterEncoding(companyMatch?.[1]?.trim() || 'Company Name'),
  };
};

export const extractCoverLetterBody = (content: string): string => {
  // Extract main body content, removing header and footer elements
  let bodyContent = content
    .replace(/^.*?Dear\s+[^,]+,\s*/is, '') // Remove everything before greeting
    .replace(/\s*Sincerely,.*$/is, '') // Remove closing and signature
    .replace(/^.*?Perfect!.*?cover letter.*?:/i, '') // Remove AI artifacts
    .replace(/^.*?Your.*?cover letter.*?is ready.*?$/gm, '')
    .replace(/---+/g, '')
    .trim();
  
  // Split into logical paragraphs and clean up
  const sentences = bodyContent.split(/\.\s+/);
  const paragraphs = [];
  let currentParagraph = [];
  
  sentences.forEach((sentence, index) => {
    currentParagraph.push(sentence.trim());
    
    // Create paragraph breaks at logical points
    if (currentParagraph.length >= 3 || 
        sentence.includes('experience') || 
        sentence.includes('particularly drawn') ||
        sentence.includes('Thank you')) {
      paragraphs.push(currentParagraph.join('. ') + (index < sentences.length - 1 ? '.' : ''));
      currentParagraph = [];
    }
  });
  
  // Add any remaining content
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join('. ') + '.');
  }
  
  return paragraphs.join('\n\n');
};

// Cover Letter Specific Formatting Functions
export const extractCoverLetterFromAIResponse = (aiResponse: string): string => {
  // Remove AI wrapper text and extract just the cover letter content
  let coverLetter = aiResponse
    .replace(/^.*?Perfect!.*?cover letter.*?:/i, '') // Remove AI intro
    .replace(/^.*?Your.*?cover letter.*?is ready.*?$/gm, '') // Remove AI outro
    .replace(/---+.*$/s, '') // Remove everything after separator
    .replace(/🎉.*$/s, '') // Remove celebration text
    .replace(/✅.*$/gm, '') // Remove checkmarks
    .replace(/Click the download buttons.*$/s, '') // Remove download instructions
    .trim();
  
  return coverLetter;
};

export const formatCoverLetterHeader = (contactInfo: any): string => {
  // Debug: Log contact info in formatting function
  console.log('formatCoverLetterHeader - Received contact info:', contactInfo);
  console.log('formatCoverLetterHeader - contactInfo.location specifically:', contactInfo.location);
  console.log('formatCoverLetterHeader - typeof contactInfo.location:', typeof contactInfo.location);
  console.log('formatCoverLetterHeader - contactInfo.location === null:', contactInfo.location === null);
  console.log('formatCoverLetterHeader - contactInfo.location === undefined:', contactInfo.location === undefined);
  console.log('formatCoverLetterHeader - contactInfo.location === "":', contactInfo.location === '');
  
  // Format contact information in professional 2-3 line format
  const headerLines = [];
  
  // Line 1: Full Name
  headerLines.push(contactInfo.fullName || 'Your Name');
  
  // Line 2: Email | Phone | Location (combine with separators)
  const contactLine = [
    contactInfo.email || 'your.email@example.com',
    contactInfo.phone || null,
    contactInfo.location || 'Your City, Country'
  ].filter(Boolean).join(' | ');
  
  // Debug: Log the contact line being created
  console.log('formatCoverLetterHeader - Contact line:', contactLine);
  console.log('formatCoverLetterHeader - Contact line parts before filter:', [
    contactInfo.email || 'your.email@example.com',
    contactInfo.phone || null,
    contactInfo.location || 'Your City, Country'
  ]);
  console.log('formatCoverLetterHeader - Contact line parts after filter:', [
    contactInfo.email || 'your.email@example.com',
    contactInfo.phone || null,
    contactInfo.location || 'Your City, Country'
  ].filter(Boolean));
  
  if (contactLine) {
    headerLines.push(contactLine);
  }
  
  console.log('formatCoverLetterHeader - Final header lines:', headerLines);
  console.log('formatCoverLetterHeader - Final header result:', headerLines.join('\n'));
  
  // Line 3: LinkedIn/Portfolio (if provided)
  if (contactInfo.linkedin) {
    headerLines.push(contactInfo.linkedin);
  } else if (contactInfo.portfolio) {
    headerLines.push(contactInfo.portfolio);
  }
  
  return headerLines.join('\n');
};

export const formatCoverLetterBody = (bodyContent: string): string => {
  // Split content into logical paragraphs with proper spacing
  const paragraphs = bodyContent
    .split(/\n+/) // Split on existing line breaks
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // Process each paragraph to ensure proper sentence structure
  const formattedParagraphs = paragraphs.map(paragraph => {
    // Ensure paragraph ends with proper punctuation
    if (!paragraph.match(/[.!?]$/)) {
      paragraph += '.';
    }
    
    // Clean up spacing within paragraph
    return paragraph.replace(/\s+/g, ' ').trim();
  });
  
  // Join paragraphs with double line breaks for proper spacing
  return formattedParagraphs.join('\n\n');
};

export const formatCompleteCoverLetter = (rawContent: string, contactInfo: any): string => {
  // Extract just the cover letter content from AI response
  const cleanContent = extractCoverLetterFromAIResponse(rawContent);
  
  // Extract different parts of the cover letter
  const dateMatch = cleanContent.match(/(\w+ \d{1,2}, \d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Extract company and position from content
  const companyMatch = cleanContent.match(/(?:at|for)\s+([A-Z][a-zA-Z\s&.,-]+?)(?:\s+for|\s+as|\.|,|\s+role|\s+position)/i) ||
                      cleanContent.match(/Dear.*?Manager.*?at\s+([A-Z][a-zA-Z\s&.,-]+)/i);
  const positionMatch = cleanContent.match(/(?:for|as)\s+(?:the\s+)?([A-Z][a-zA-Z\s&.,-]+?)(?:\s+position|\s+role|\s+at)/i) ||
                       cleanContent.match(/applying\s+for\s+(?:the\s+)?([A-Z][a-zA-Z\s&.,-]+?)(?:\s+position|\s+role)/i);
  
  const company = companyMatch?.[1]?.trim() || 'Company Name';
  const position = positionMatch?.[1]?.trim() || 'Position';
  
  // Extract body content (everything between greeting and closing)
  const bodyMatch = cleanContent.match(/Dear[^,]+,\s*([\s\S]*?)\s*Sincerely,/i);
  let bodyContent = bodyMatch ? bodyMatch[1].trim() : cleanContent;
  
  // Limit body content to 3 paragraphs maximum for single page
  const paragraphs = bodyContent.split('\n\n').filter(p => p.trim());
  if (paragraphs.length > 3) {
    bodyContent = paragraphs.slice(0, 3).join('\n\n');
  }
  
  // Format the complete cover letter
  const formattedHeader = formatCoverLetterHeader(contactInfo);
  console.log('formatCompleteCoverLetter - Formatted header result:', formattedHeader);
  const formattedBody = formatCoverLetterBody(bodyContent);
  
  const formattedCoverLetter = `${formattedHeader}

${date}

${company}

Re: Application for ${position}

Dear Hiring Manager,

${formattedBody}

Sincerely,

${contactInfo.fullName || 'Your Name'}`;

  return formattedCoverLetter;
};