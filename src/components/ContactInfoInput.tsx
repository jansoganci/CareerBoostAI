import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase, Edit3, Save, X } from 'lucide-react';

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  professionalTitle: string;
}

interface ContactInfoInputProps {
  contactInfo: ContactInfo | null;
  onContactInfoSave: (contactInfo: ContactInfo) => void;
  onClear?: () => void;
}

const defaultContactInfo: ContactInfo = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  professionalTitle: ''
};

export const ContactInfoInput: React.FC<ContactInfoInputProps> = ({
  contactInfo,
  onContactInfoSave,
  onClear
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ContactInfo>(contactInfo || defaultContactInfo);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-enable editing if no contact info exists
  useEffect(() => {
    if (!contactInfo || !hasRequiredFields) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [contactInfo]);

  // Update editing data when contactInfo prop changes
  useEffect(() => {
    setEditData(contactInfo || defaultContactInfo);
  }, [contactInfo]);

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]); // Clear errors when user starts typing
  };

  const validateContactInfo = (data: ContactInfo): string[] => {
    const validationErrors: string[] = [];

    if (!data.fullName || data.fullName.length < 2) {
      validationErrors.push('Full name is required and must be at least 2 characters');
    }

    if (!data.email) {
      validationErrors.push('Email address is required');
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email)) {
        validationErrors.push('Please enter a valid email address');
      }
    }

    if (!data.location || data.location.length < 2) {
      validationErrors.push('Current location is required');
    }

    if (!data.professionalTitle || data.professionalTitle.length < 2) {
      validationErrors.push('Professional title is required');
    }

    // Optional field validations
    if (data.linkedin && !data.linkedin.includes('linkedin.com')) {
      validationErrors.push('LinkedIn URL should contain "linkedin.com"');
    }

    if (data.portfolio && !data.portfolio.startsWith('http')) {
      validationErrors.push('Portfolio website should start with "http://" or "https://"');
    }

    return validationErrors;
  };

  const handleSave = () => {
    // Trim values only during validation and saving, not during typing
    const trimmedData = {
      ...editData,
      fullName: editData.fullName.trim(),
      email: editData.email.trim(),
      phone: editData.phone.trim(),
      location: editData.location.trim(),
      professionalTitle: editData.professionalTitle.trim(),
      linkedin: editData.linkedin.trim(),
      portfolio: editData.portfolio.trim()
    };
    
    // Debug: Log the contact info being saved
    console.log('ContactInfoInput - Saving contact info:', trimmedData);
    
    const validationErrors = validateContactInfo(trimmedData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onContactInfoSave(trimmedData);
    setIsEditing(false);
    setErrors([]);
  };

  const handleCancel = () => {
    setEditData(contactInfo || defaultContactInfo);
    setIsEditing(false);
    setErrors([]);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors([]);
  };

  const hasRequiredFields = contactInfo?.fullName && contactInfo?.email && contactInfo?.location && contactInfo?.professionalTitle;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <User className="w-4 h-4" />
          <span>Contact Information</span>
        </label>
        {contactInfo && !isEditing && (
          <div className="flex items-center space-x-2">
            {onClear && (
              <button
                onClick={onClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear contact information"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit contact information"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={editData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
                <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>Current Location *</span>
              </label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="Your City, Your Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Professional Title */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Briefcase className="w-4 h-4" />
                <span>Professional Title *</span>
              </label>
              <input
                type="text"
                value={editData.professionalTitle}
                onChange={(e) => handleFieldChange('professionalTitle', e.target.value)}
                placeholder="Your Professional Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn Profile</span>
                <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                value={editData.linkedin}
                onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Portfolio Website - Full Width */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Globe className="w-4 h-4" />
              <span>Portfolio Website</span>
              <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <input
              type="url"
              value={editData.portfolio}
              onChange={(e) => handleFieldChange('portfolio', e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              * Required fields
            </p>
            <div className="flex space-x-2">
              {contactInfo && (
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>Save Contact Info</span>
              </button>
            </div>
          </div>
        </div>
      ) : contactInfo && hasRequiredFields ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-green-800">{contactInfo.fullName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-green-800">{contactInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-green-800">{contactInfo.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-green-600" />
              <span className="text-green-800">{contactInfo.professionalTitle}</span>
            </div>
            {contactInfo.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-green-800">{contactInfo.phone}</span>
              </div>
            )}
            {contactInfo.linkedin && (
              <div className="flex items-center space-x-2">
                <Linkedin className="w-4 h-4 text-green-600" />
                <span className="text-green-800 truncate">LinkedIn Profile</span>
              </div>
            )}
            {contactInfo.portfolio && (
              <div className="flex items-center space-x-2 md:col-span-2">
                <Globe className="w-4 h-4 text-green-600" />
                <span className="text-green-800 truncate">{contactInfo.portfolio}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <User className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm mb-2">Add your contact information</p>
          <p className="text-xs text-gray-500">
            Required for generating professional cover letters
          </p>
        </div>
      )}
    </div>
  );
};