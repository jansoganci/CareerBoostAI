import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Edit3, Check, AlertCircle } from 'lucide-react';
import { ContactInfo, ExtractionResult, validateContactInfo } from '../utils/contactExtractor';

interface ContactInfoCollectorProps {
  extractionResult: ExtractionResult;
  onContactInfoConfirmed: (contactInfo: ContactInfo) => void;
  onCancel: () => void;
}

export const ContactInfoCollector: React.FC<ContactInfoCollectorProps> = ({
  extractionResult,
  onContactInfoConfirmed,
  onCancel
}) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(extractionResult.contactInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-enable editing if critical fields are missing
  useEffect(() => {
    if (extractionResult.missingFields.length > 0) {
      setIsEditing(true);
    }
  }, [extractionResult.missingFields]);

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value.trim() || null
    }));
    setErrors([]); // Clear errors when user starts typing
  };

  const handleConfirm = () => {
    const validation = validateContactInfo(contactInfo);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsEditing(true);
      return;
    }

    onContactInfoConfirmed(contactInfo);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return '✅';
      case 'medium': return '⚠️';
      case 'low': return '❓';
      default: return '❌';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>Contact Information for Cover Letter</span>
        </h3>
        {!isEditing && extractionResult.missingFields.length === 0 && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit contact information"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {extractionResult.missingFields.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Missing Information</p>
              <p>I couldn't find these details in your resume: {extractionResult.missingFields.join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <User className="w-4 h-4" />
            <span>Full Name</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(extractionResult.confidence.name)}`}>
              {getConfidenceIcon(extractionResult.confidence.name)} {extractionResult.confidence.name}
            </span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={contactInfo.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {contactInfo.name || 'Not provided'}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            <span>Email Address</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(extractionResult.confidence.email)}`}>
              {getConfidenceIcon(extractionResult.confidence.email)} {extractionResult.confidence.email}
            </span>
          </label>
          {isEditing ? (
            <input
              type="email"
              value={contactInfo.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {contactInfo.email || 'Not provided'}
            </div>
          )}
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(extractionResult.confidence.location)}`}>
              {getConfidenceIcon(extractionResult.confidence.location)} {extractionResult.confidence.location}
            </span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={contactInfo.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="City, Country (e.g., Bangkok, Thailand)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {contactInfo.location || 'Not provided'}
            </div>
          )}
        </div>

        {/* Phone Field (Optional) */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Phone className="w-4 h-4" />
            <span>Phone Number</span>
            <span className="text-xs text-gray-500">(Optional)</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(extractionResult.confidence.phone)}`}>
              {getConfidenceIcon(extractionResult.confidence.phone)} {extractionResult.confidence.phone}
            </span>
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={contactInfo.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="Enter your phone number (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {contactInfo.phone || 'Not provided'}
            </div>
          )}
        </div>

        {/* LinkedIn Field (Optional) */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn Profile</span>
            <span className="text-xs text-gray-500">(Optional)</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(extractionResult.confidence.linkedin)}`}>
              {getConfidenceIcon(extractionResult.confidence.linkedin)} {extractionResult.confidence.linkedin}
            </span>
          </label>
          {isEditing ? (
            <input
              type="url"
              value={contactInfo.linkedin || ''}
              onChange={(e) => handleFieldChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {contactInfo.linkedin || 'Not provided'}
            </div>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Please fix the following:</p>
              <ul className="list-disc list-inside mt-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        
        <div className="flex space-x-3">
          {isEditing && extractionResult.missingFields.length === 0 && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel Edit
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Generate Cover Letter</span>
          </button>
        </div>
      </div>
    </div>
  );
};