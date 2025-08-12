import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User, Bot, Download, FileText } from 'lucide-react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { exportToPDF, exportToDocx } from '../utils/documentExport';
import { validateDocumentContent } from '../utils/textUtils';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  jobDescription?: { jobTitle?: string; companyName?: string } | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  disabled = false,
  jobDescription = null
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Only scroll within the chat container, not the entire page
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest', // Prevent page-level scrolling
      inline: 'nearest'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Remove auto-focus behavior that might cause page scrolling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading && !disabled) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      // Removed auto-focus to prevent unwanted scrolling
    }
  };

  const handleQuickAction = (action: string) => {
    if (!isLoading && !disabled) {
      onSendMessage(action);
      // Removed auto-focus to prevent unwanted scrolling
    }
  };

  const handleExportPDF = async (content: string) => {
    try {
      await exportToPDF({ 
        content,
        jobTitle: jobDescription?.jobTitle,
        companyName: jobDescription?.companyName
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportDocx = async (content: string) => {
    try {
      await exportToDocx({ 
        content,
        jobTitle: jobDescription?.jobTitle,
        companyName: jobDescription?.companyName
      });
    } catch (error) {
      console.error('Failed to export DOCX:', error);
      alert('Failed to export DOCX. Please try again.');
    }
  };

  const isCoverLetter = (content: string) => {
    return validateDocumentContent(content, 'cover-letter');
  };

  const isOptimizedResume = (content: string) => {
    return validateDocumentContent(content, 'resume');
  };


  return (
    <div className="flex flex-col h-[600px] border border-gray-300 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-800">Chat with AI Recruiter</h3>
      </div>

      {/* Quick Actions */}
      {!disabled && (
        <div className={`p-3 border-b border-gray-100 bg-gray-50 ${messages.length > 0 ? 'py-2' : ''}`}>
          <p className={`text-xs text-gray-600 mb-2 ${messages.length > 0 ? 'mb-1' : ''}`}>
            {messages.length === 0 ? 'Quick actions:' : 'Quick actions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('Generate a cover letter for this position')}
              disabled={isLoading}
              className={`px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50 transition-colors ${messages.length > 0 ? 'px-2 py-0.5' : ''}`}
            >
              📝 Generate Cover Letter
            </button>
            <button
              onClick={() => handleQuickAction('Optimize my resume for this position')}
              disabled={isLoading}
              className={`px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 disabled:opacity-50 transition-colors ${messages.length > 0 ? 'px-2 py-0.5' : ''}`}
            >
              🎯 Optimize Resume
            </button>
            <button
              onClick={() => handleQuickAction('What are the key requirements for this role?')}
              disabled={isLoading}
              className={`px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50 transition-colors ${messages.length > 0 ? 'px-2 py-0.5' : ''}`}
            >
              📋 Key Requirements
            </button>
            <button
              onClick={() => handleQuickAction('How well do my skills match this position?')}
              disabled={isLoading}
              className={`px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 disabled:opacity-50 transition-colors ${messages.length > 0 ? 'px-2 py-0.5' : ''}`}
            >
              📊 Skills Match
            </button>
          </div>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Ready to help with job analysis and cover letters!</p>
            <p className="text-xs mt-1">Try the quick actions above or ask any question</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {message.role === 'assistant' ? (
                      <div>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {(isCoverLetter(message.content) || isOptimizedResume(message.content)) && (
                          <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleExportPDF(message.content)}
                              className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => handleExportDocx(message.content)}
                              className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              <span>DOCX</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={disabled ? "Add profile, contact info, CV and job description first..." : "Ask about the position, your fit, or get advice..."}
            disabled={disabled || isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};