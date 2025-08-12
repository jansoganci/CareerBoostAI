import React from 'react';
import { Briefcase, X } from 'lucide-react';
import { parseJobDescription } from '../utils/jobDescriptionParser';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string, jobTitle?: string, companyName?: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Paste the job description here..."
}) => {
  const handleChange = (newValue: string) => {
    // Parse job description to extract title and company
    const parsed = parseJobDescription(newValue);
    onChange(newValue, parsed.jobTitle || undefined, parsed.companyName || undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Briefcase className="w-4 h-4" />
          <span>Job Description</span>
        </label>
        {value && (
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {value && (
        <p className="text-xs text-gray-500">
          {value.length} characters
        </p>
      )}
    </div>
  );
};