import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Zap, AlertCircle, X } from 'lucide-react';
import { ProfileInput } from './components/ProfileInput';
import { ContactInfoInput, ContactInfo } from './components/ContactInfoInput';
import { FileUpload } from './components/FileUpload';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { MatchResult } from './components/MatchResult';
import { ChatInterface } from './components/ChatInterface';
import { GeminiService } from './services/geminiService';
import { ChatMessage, MatchResult as MatchResultType, CVData, JobDescription, UserProfile } from './types';
import { saveToStorage, loadFromStorage, removeFromStorage, STORAGE_KEYS } from './utils/storage';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultType | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [geminiService] = useState(() => new GeminiService());

  // Load saved data on component mount
  useEffect(() => {
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    const savedContactInfo = loadFromStorage(STORAGE_KEYS.CONTACT_INFO);
    const savedCV = loadFromStorage(STORAGE_KEYS.CV_DATA);
    const savedJob = loadFromStorage(STORAGE_KEYS.JOB_DESCRIPTION);
    
    if (savedProfile) {
      setUserProfile({
        ...savedProfile,
        savedAt: new Date(savedProfile.savedAt)
      });
    }
    
    if (savedContactInfo) {
      setContactInfo({
        ...savedContactInfo,
        savedAt: new Date(savedContactInfo.savedAt)
      });
    }
    
    if (savedCV) {
      setCvData({
        ...savedCV,
        uploadedAt: new Date(savedCV.uploadedAt)
      });
    }
    
    if (savedJob) {
      setJobDescription({
        ...savedJob,
        addedAt: new Date(savedJob.addedAt)
      });
    }
  }, []);

  const handleProfileSave = useCallback((content: string) => {
    const newProfile = {
      content,
      savedAt: new Date()
    };
    setUserProfile(newProfile);
    saveToStorage(STORAGE_KEYS.USER_PROFILE, newProfile);
    clearError();
    resetAnalysis();
  }, []);

  const handleContactInfoSave = useCallback((contactData: ContactInfo) => {
    const newContactInfo = {
      ...contactData,
      savedAt: new Date()
    };
    
    // Debug: Log contact info received in App component
    console.log('App - Received contact info:', newContactInfo);
    
    setContactInfo(newContactInfo);
    saveToStorage(STORAGE_KEYS.CONTACT_INFO, newContactInfo);
    clearError();
  }, []);

  const handleCVUpload = useCallback((content: string, fileName: string) => {
    // Handle both PDF and text sources with priority logic already applied in FileUpload
    // The content parameter now contains the prioritized content (text || PDF)
    const newCVData = {
      content,
      fileName,
      uploadedAt: new Date()
    };
    setCvData(newCVData);
    saveToStorage(STORAGE_KEYS.CV_DATA, newCVData);
    clearError();
    resetAnalysis();
  }, []);

  const handleJobDescriptionChange = useCallback((content: string, jobTitle?: string, companyName?: string) => {
    const newJobData = {
      content,
      jobTitle,
      companyName,
      addedAt: new Date()
    };
    setJobDescription(newJobData);
    saveToStorage(STORAGE_KEYS.JOB_DESCRIPTION, newJobData);
    clearError();
    // Don't reset analysis, just clear previous result
    setMatchResult(null);
  }, []);

  const resetAnalysis = useCallback(() => {
    setMatchResult(null);
    setChatMessages([]);
    geminiService.reset();
  }, [geminiService]);

  const showErrorMessage = useCallback((message: string) => {
    setError(message);
    setShowError(true);
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      setShowError(false);
      setTimeout(() => setError(null), 300); // Wait for fade out animation
    }, 5000);
  }, []);

  const clearError = useCallback(() => {
    setShowError(false);
    setTimeout(() => setError(null), 300);
  }, []);

  const initializeChat = useCallback(async () => {
    if (!cvData || !jobDescription) return;

    try {
      await geminiService.initializeChat(cvData, jobDescription, userProfile || undefined);
    } catch (err) {
      showErrorMessage(err instanceof Error ? err.message : 'Failed to initialize chat');
    }
  }, [cvData, jobDescription, userProfile, geminiService, showErrorMessage]);

  const handleCheckMatch = useCallback(async () => {
    if (!userProfile) {
      showErrorMessage('Please add your profile information first.');
      return;
    }
    
    if (!cvData || !jobDescription) {
      showErrorMessage('Please upload your CV and provide a job description.');
      return;
    }

    setIsAnalyzing(true);
    clearError();

    try {
      await initializeChat();
      const result = await geminiService.checkMatch();
      setMatchResult(result);
    } catch (err) {
      showErrorMessage(err instanceof Error ? err.message : 'Failed to analyze job match');
    } finally {
      setIsAnalyzing(false);
    }
  }, [userProfile, cvData, jobDescription, showErrorMessage, clearError, initializeChat, geminiService]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!userProfile) {
      showErrorMessage('Please add your profile information first.');
      return;
    }
    
    if (!contactInfo) {
      showErrorMessage('Please add your contact information first.');
      return;
    }
    
    if (!cvData || !jobDescription) {
      showErrorMessage('Please upload your CV and provide a job description.');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    clearError();

    try {
      if (chatMessages.length === 0) {
        await initializeChat();
      }

      const response = await geminiService.sendMessage(message, contactInfo);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      showErrorMessage(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsChatLoading(false);
    }
  }, [userProfile, contactInfo, cvData, jobDescription, showErrorMessage, clearError, chatMessages.length, initializeChat, geminiService]);

  const canAnalyze = userProfile && contactInfo && cvData && jobDescription && !isAnalyzing;
  const canChat = userProfile && contactInfo && cvData && jobDescription;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CareerBoost AI</h1>
              <p className="text-sm text-gray-600">Your AI career companion for job matching, cover letters, and resume optimization</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Fixed Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Profile Input */}
          <div>
            <ProfileInput
              profile={userProfile?.content || ''}
              onProfileSave={handleProfileSave}
              onClear={() => {
                setUserProfile(null);
                removeFromStorage(STORAGE_KEYS.USER_PROFILE);
                resetAnalysis();
              }}
            />
          </div>

          {/* Contact Info Input */}
          <div>
            <ContactInfoInput
              contactInfo={contactInfo}
              onContactInfoSave={handleContactInfoSave}
              onClear={() => {
                setContactInfo(null);
                removeFromStorage(STORAGE_KEYS.CONTACT_INFO);
              }}
            />
          </div>

          {/* CV Upload */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">Your CV</span>
              {cvData && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Source: {cvData.fileName}
                </span>
              )}
            </div>
            <FileUpload
              label="Add Your CV Content"
              onFileProcessed={handleCVUpload}
              currentFile={cvData?.fileName}
              compact={true}
              onClear={() => {
                setCvData(null);
                removeFromStorage(STORAGE_KEYS.CV_DATA);
                // Note: FileUpload component handles its own localStorage cleanup
                resetAnalysis();
              }}
            />
          </div>

          {/* Job Description - Always Visible */}
          <div>
            <JobDescriptionInput
              value={jobDescription?.content || ''}
              onChange={handleJobDescriptionChange}
              onClear={() => {
                setJobDescription(null);
                removeFromStorage(STORAGE_KEYS.JOB_DESCRIPTION);
                setMatchResult(null);
              }}
            />
          </div>

          {/* Analysis Button */}
          <div className="text-center">
            <button
              onClick={handleCheckMatch}
              disabled={!canAnalyze}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Match...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Check Job Match</span>
                </>
              )}
            </button>
          </div>

          {/* Match Result - Right Below Button */}
          {matchResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Analysis</h3>
              <MatchResult result={matchResult} />
            </div>
          )}
        </div>

        {/* AI Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Important Disclaimer
          </h3>
          <div className="space-y-3 text-amber-800 text-sm">
            <p>
              <strong>🤖 AI-Generated Content:</strong> All outputs (job matches, cover letters, resume optimizations) are generated by AI and may contain errors, inaccuracies, or inappropriate suggestions.
            </p>
            <p>
              <strong>✅ Your Responsibility:</strong> Always carefully review, edit, and verify all AI-generated content before using it for job applications. Ensure accuracy of personal information, dates, company names, and achievements.
            </p>
            <p>
              <strong>🔒 Data Privacy:</strong> Your CV and personal information are processed locally and sent to Google's Gemini AI for analysis. Do not include sensitive information you wouldn't want processed by AI services.
            </p>
            <p>
              <strong>⚖️ No Liability:</strong> We do not guarantee job application success or take responsibility for any consequences of using AI-generated content. Use this tool as a starting point, not a final solution.
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        {canChat && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Career Advisor</h3>
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              disabled={!canChat}
              jobDescription={jobDescription}
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Add your profile information (background, experience, preferences)</li>
            <li>Add your contact information (name, email, location, etc.)</li>
            <li><strong>Paste your CV text directly</strong> (recommended) or upload PDF/Word file</li>
            <li>Paste the job description in the text area</li>
            <li>Click "Check Job Match" for personalized yes/no recommendation</li>
            <li>Use the chat to ask detailed questions about the position and your fit</li>
          </ol>
          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Best Practice:</strong> Open your CV in Word/PDF → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste in the text area. 
              This method preserves exact formatting, ensures accurate work history ordering, and provides the highest quality AI analysis for job matching and resume optimization.
            </p>
          </div>
          <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✨ Why Text Input Works Better:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700">
              <div>• <strong>Perfect accuracy:</strong> No parsing errors</div>
              <div>• <strong>Faster processing:</strong> Instant analysis</div>
              <div>• <strong>Easy editing:</strong> Make quick improvements</div>
              <div>• <strong>Better results:</strong> Higher quality outputs</div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Error Notification */}
      {error && (
        <div className={`fixed bottom-4 right-4 max-w-md z-50 transition-all duration-300 transform ${
          showError ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium">Error</h3>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;