// Job description parsing utility to extract job title and company name

export interface ParsedJobInfo {
  jobTitle: string | null;
  companyName: string | null;
}

export const parseJobDescription = (content: string): ParsedJobInfo => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let jobTitle: string | null = null;
  let companyName: string | null = null;

  // Extract job title - look for common patterns in first few lines
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    
    // Skip very short lines or lines with too many special characters
    if (line.length < 3 || line.split(/[^a-zA-Z\s]/).length > line.split(' ').length) {
      continue;
    }
    
    // Look for job title patterns
    const jobTitlePatterns = [
      // Direct job title patterns
      /^(?:job title|position|role):\s*(.+)$/i,
      /^(.+?)\s*(?:position|role|job)$/i,
      // Common job titles
      /^(.*(?:manager|director|analyst|consultant|engineer|developer|designer|specialist|coordinator|assistant|lead|senior|junior|intern).*)$/i,
      // First substantial line that looks like a job title
      /^([A-Z][a-zA-Z\s&,-]{5,50})$/
    ];
    
    for (const pattern of jobTitlePatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        // Validate it looks like a job title
        if (candidate.length >= 5 && candidate.length <= 60 && 
            !candidate.toLowerCase().includes('company') &&
            !candidate.toLowerCase().includes('about') &&
            !candidate.toLowerCase().includes('description')) {
          jobTitle = candidate;
          break;
        }
      }
    }
    
    if (jobTitle) break;
  }

  // Extract company name - look for common patterns
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    
    const companyPatterns = [
      // Direct company patterns
      /^(?:company|organization|employer):\s*(.+)$/i,
      /^(.+?)\s*(?:is looking for|seeks|hiring).*$/i,
      /^(?:at|for|with)\s+(.+?)(?:\s|$)/i,
      // Company name followed by common indicators
      /^(.+?)\s*(?:inc|ltd|llc|corp|corporation|company|group|solutions|technologies|systems)\.?$/i,
      // Lines that mention the company context
      /(?:join|work at|employed by|position at)\s+(.+?)(?:\s|$|,)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        // Validate it looks like a company name
        if (candidate.length >= 2 && candidate.length <= 50 &&
            !candidate.toLowerCase().includes('position') &&
            !candidate.toLowerCase().includes('role') &&
            !candidate.toLowerCase().includes('job')) {
          companyName = candidate;
          break;
        }
      }
    }
    
    if (companyName) break;
  }

  return {
    jobTitle,
    companyName
  };
};