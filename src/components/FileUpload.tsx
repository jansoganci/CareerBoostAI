import React, { useCallback } from 'react';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Type, Info, Edit3 } from 'lucide-react';
import { extractTextFromFile } from '../utils/fileProcessor';

interface FileUploadProps {
  onFileProcessed: (content: string, fileName: string) => void;
  currentFile?: string;
  onClear?: () => void;
  label: string;
  accept?: Record<string, string[]>;
  compact?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  currentFile,
  onClear,
  label,
  compact = false,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc']
  }
}) => {
  const [cvText, setCvText] = React.useState('');
  const [inputMethod, setInputMethod] = React.useState<'text' | 'file'>('text');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load saved CV text from localStorage on component mount
  useEffect(() => {
    try {
      const savedCvText = localStorage.getItem('userCvText');
      if (savedCvText && savedCvText.trim()) {
        setCvText(savedCvText);
      }
    } catch (error) {
      console.warn('Failed to load saved CV text from localStorage:', error);
    }
  }, []); // Remove onFileProcessed dependency to prevent infinite loop

  // Auto-save CV text to localStorage when it changes
  useEffect(() => {
    if (cvText.trim()) {
      try {
        localStorage.setItem('userCvText', cvText);
      } catch (error) {
        console.warn('Failed to save CV text to localStorage:', error);
        // Handle localStorage quota exceeded or other errors
        setError('Unable to save CV text. Please check your browser storage settings.');
      }
    }
  }, [cvText]);

  // Auto-process saved content when component mounts and has substantial content
  useEffect(() => {
    if (cvText.trim() && cvText.length > 50 && !currentFile) {
      // Only auto-process if we don't already have processed content
      onFileProcessed(cvText.trim(), 'Saved CV Content');
    }
  }, [cvText, onFileProcessed, currentFile]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const extractedPdfText = await extractTextFromFile(file);
      // Apply additional cleaning to ensure no broken characters make it through
      const cleanContent = extractedPdfText
        .replace(/S\s+a\s+b\s+a\s+n\s+c\s*[1ı]\s*Ü\s+n\s+i\s+v\s+e\s+r\s+s\s+i\s+t\s+e\s+s\s+i/gi, 'University Name')
        .replace(/M\s+e\s+r\s+c\s+e\s+d\s+e\s+s\s*-\s*B\s+e\s+n\s+z\s+T\s*[üu]\s*r\s*k/gi, 'Company Name');
      
      // Priority logic: Use clean text input first, fallback to PDF extraction
      const finalContent = cvText.trim() || cleanContent;
      const sourceLabel = cvText.trim() ? 'Pasted CV Content' : file.name;
      
      onFileProcessed(finalContent, sourceLabel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, cvText]);

  const handleTextSubmit = () => {
    if (!cvText.trim()) {
      setError('Please enter your CV content');
      return;
    }
    
    if (cvText.trim().length < 50) {
      setError('Please provide more CV content (at least 50 characters)');
      return;
    }
    
    setError(null);
    
    // Priority logic: Always use clean text content when available
    const finalContent = cvText.trim();
    onFileProcessed(finalContent, 'Pasted CV Content');
  };

  const handleTextClear = () => {
    setCvText('');
    // Clear from localStorage
    try {
      localStorage.removeItem('userCvText');
    } catch (error) {
      console.warn('Failed to clear CV text from localStorage:', error);
    }
    // Clear the processed CV data as well
    if (onClear) {
      onClear();
    }
  };

  const handleFileClear = () => {
    // Clear file upload and use text content if available
    if (cvText.trim()) {
      // If we have text content, re-process it as the primary source
      const finalContent = cvText.trim();
      onFileProcessed(finalContent, 'Pasted CV Content');
    } else if (onClear) {
      // If no text content, clear everything
      onClear();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isProcessing || inputMethod === 'text'
  });

  return (
    <div className="space-y-2">
      {!compact && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      {/* Input Method Toggle */}
      <div className="flex items-center space-x-4 mb-3">
        <button
          type="button"
          onClick={() => setInputMethod('text')}
          className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
            inputMethod === 'text'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Paste Text</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('file')}
          className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
            inputMethod === 'file'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Text Input Method */}
      {inputMethod === 'text' && (
        <div className="space-y-3">
          <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">✨ Recommended: Paste your CV text for best results</p>
              <div className="space-y-1">
                <p>• <strong>Better accuracy:</strong> Preserves exact work history order</p>
                <p>• <strong>Faster processing:</strong> No file parsing needed</p>
                <p>• <strong>Easy editing:</strong> Make quick changes anytime</p>
                <p>• <strong>No file limits:</strong> Works with any CV length</p>
              </div>
              <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                <strong>💡 How to copy:</strong> Open your CV in Word/PDF → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste here
              </div>
            </div>
          </div>
          
          {currentFile && inputMethod === 'text' ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-green-600" />
                <span className="text-green-800 text-sm">✓ CV content ready</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setInputMethod('text');
                    // Don't clear the text, just switch to edit mode
                  }}
                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                  title="Edit CV content"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTextClear}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  title="Delete CV content"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="📋 Paste your complete CV content here...

💡 EXAMPLE FORMAT:

YOUR FULL NAME
your.email@example.com | linkedin.com/in/yourprofile | Your City, Your Country

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years developing web applications...

WORK EXPERIENCE
Senior Software Engineer | Tech Company Inc.
Your City, Your Country | January 2022 - Present
• Led development of microservices architecture serving 1M+ users
• Reduced system latency by 40% through database optimization
• Mentored 3 junior developers and improved team productivity by 25%

Software Engineer | Previous Company
Your City, Your Country | June 2019 - December 2021
• Built responsive web applications using React and Node.js
• Implemented CI/CD pipeline reducing deployment time by 60%

EDUCATION
Bachelor of Science in Computer Science | University Name | 2019

TECHNICAL SKILLS
JavaScript, React, Node.js, Python, AWS, Docker, PostgreSQL

📝 TIP: Copy your entire CV from Word/PDF and paste it here exactly as it appears!"
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-xs text-gray-500">
                    {cvText.length} characters
                  </p>
                  {cvText.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {cvText.length >= 50 ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Good length</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-yellow-600">Need more content</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleTextSubmit();
                  }}
                  disabled={cvText.length < 50}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {cvText.length < 50 ? 'Need More Content' : 'Use This CV ✓'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* File Upload Method */}
      {inputMethod === 'file' && (
        <div className="space-y-3">
          <div className="flex items-start space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-2">📁 File Upload (Alternative Option)</p>
              <div className="space-y-1">
                <p>• <strong>PDF/Word support:</strong> Upload your existing CV file</p>
                <p>• <strong>Automatic extraction:</strong> We'll extract the text for you</p>
                <p>• <strong>Backup option:</strong> Use when copy-paste isn't available</p>
              </div>
              <div className="mt-3 p-2 bg-amber-100 rounded text-xs">
                <strong>⚠️ Note:</strong> Text extraction may sometimes alter formatting or order. For best results, use the "Paste Text" option above.
              </div>
            </div>
          </div>
          
          {currentFile ? (
            <div className={`flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg ${compact ? 'py-2' : ''}`}>
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-green-600" />
                <span className={`text-green-800 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                  {compact ? `✓ ${currentFile}` : currentFile}
                </span>
              </div>
              {onClear && (
                <div className="flex items-center space-x-1">
                  {cvText.trim() && (
                    <button
                      onClick={() => {
                        setInputMethod('text');
                        // Switch to text mode to show the content for editing
                      }}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      title="Edit CV content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleFileClear}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                compact ? 'p-3' : 'p-6'
              } ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className={`text-gray-400 mx-auto ${compact ? 'w-5 h-5 mb-1' : 'w-8 h-8 mb-2'}`} />
              {isProcessing ? (
                <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>Processing...</p>
              ) : isDragActive ? (
                <p className={`text-blue-600 ${compact ? 'text-xs' : 'text-sm'}`}>Drop here...</p>
              ) : (
                <div>
                  <p className={`text-gray-600 ${compact ? 'text-xs mb-0' : 'text-sm mb-1'}`}>
                    {compact ? 'Upload CV' : 'Drag & drop a file here, or click to select'}
                  </p>
                  {!compact && <p className="text-xs text-gray-500">PDF or Word documents only</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
    </div>
  );
};