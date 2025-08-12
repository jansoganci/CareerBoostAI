// Contact information extraction utility
export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
}

export interface ExtractionResult {
  contactInfo: ContactInfo;
  confidence: {
    name: 'high' | 'medium' | 'low' | 'none';
    email: 'high' | 'medium' | 'low' | 'none';
    phone: 'high' | 'medium' | 'low' | 'none';
    location: 'high' | 'medium' | 'low' | 'none';
    linkedin: 'high' | 'medium' | 'low' | 'none';
  };
  missingFields: string[];
}

export const extractContactInfo = (cvContent: string, userProfile?: string): ExtractionResult => {
  const lines = cvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const allText = cvContent + (userProfile ? '\n' + userProfile : '');
  
  const contactInfo: ContactInfo = {
    name: null,
    email: null,
    phone: null,
    location: null,
    linkedin: null
  };

  const confidence = {
    name: 'none' as const,
    email: 'none' as const,
    phone: 'none' as const,
    location: 'none' as const,
    linkedin: 'none' as const
  };

  // Extract Email (highest priority - most reliable)
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emailMatch = allText.match(emailRegex);
  if (emailMatch && emailMatch[0]) {
    contactInfo.email = emailMatch[0];
    confidence.email = 'high';
  }

  // Extract Phone
  const phoneRegex = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9})/g;
  const phoneMatch = allText.match(phoneRegex);
  if (phoneMatch && phoneMatch[0] && phoneMatch[0].replace(/\D/g, '').length >= 7) {
    contactInfo.phone = phoneMatch[0];
    confidence.phone = 'high';
  }

  // Extract LinkedIn
  const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
  const linkedinMatch = allText.match(linkedinRegex);
  if (linkedinMatch && linkedinMatch[0]) {
    contactInfo.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : 'https://' + linkedinMatch[0];
    confidence.linkedin = 'high';
  }

  // Extract Name (first non-contact line, or line before contact info)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    
    // Skip lines that are clearly not names
    if (line.includes('@') || line.includes('http') || line.includes('+') || 
        line.toLowerCase().includes('summary') || line.toLowerCase().includes('experience') ||
        line.toLowerCase().includes('education') || line.toLowerCase().includes('skills')) {
      continue;
    }

    // Look for name patterns
    const namePattern = /^[A-Z][a-zA-Z\s]{2,50}$/;
    if (namePattern.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
      contactInfo.name = line;
      confidence.name = 'high';
      break;
    }
  }

  // Extract Location (look for city, country patterns)
  const locationPatterns = [
    // City, Country format
    /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)/g,
    // Just country names
    /(Turkey|Thailand|Singapore|Malaysia|Indonesia|Philippines|Vietnam|India|China|Japan|Korea|Germany|France|UK|USA|Canada|Australia)/gi
  ];

  for (const pattern of locationPatterns) {
    const locationMatch = allText.match(pattern);
    if (locationMatch && locationMatch[0]) {
      // Filter out obvious non-locations
      const location = locationMatch[0];
      if (!location.toLowerCase().includes('university') && 
          !location.toLowerCase().includes('company') &&
          !location.toLowerCase().includes('ltd') &&
          !location.toLowerCase().includes('inc')) {
        contactInfo.location = location;
        confidence.location = location.includes(',') ? 'high' : 'medium';
        break;
      }
    }
  }

  // If no name found, try alternative approaches
  if (!contactInfo.name) {
    // Look for name in email prefix
    if (contactInfo.email) {
      const emailPrefix = contactInfo.email.split('@')[0];
      const nameParts = emailPrefix.split(/[._-]/).map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      );
      if (nameParts.length >= 2) {
        contactInfo.name = nameParts.join(' ');
        confidence.name = 'medium';
      }
    }
  }

  // Determine missing critical fields
  const missingFields: string[] = [];
  if (!contactInfo.name) missingFields.push('name');
  if (!contactInfo.email) missingFields.push('email');
  if (!contactInfo.location) missingFields.push('location');

  return {
    contactInfo,
    confidence,
    missingFields
  };
};

// Validate extracted contact info
export const validateContactInfo = (contactInfo: ContactInfo): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!contactInfo.name || contactInfo.name.length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!contactInfo.email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(contactInfo.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  if (!contactInfo.location || contactInfo.location.length < 2) {
    errors.push('Location is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format contact info for display
export const formatContactInfo = (contactInfo: ContactInfo): string => {
  const parts: string[] = [];
  
  if (contactInfo.name) parts.push(contactInfo.name);
  if (contactInfo.email) parts.push(contactInfo.email);
  if (contactInfo.phone) parts.push(contactInfo.phone);
  if (contactInfo.location) parts.push(contactInfo.location);
  if (contactInfo.linkedin) parts.push(contactInfo.linkedin);
  
  return parts.join(' | ');
};