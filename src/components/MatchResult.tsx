import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { MatchResult as MatchResultType } from '../types';

interface MatchResultProps {
  result: MatchResultType;
}

export const MatchResult: React.FC<MatchResultProps> = ({ result }) => {
  const isMatch = result.decision === 'yes';
  
  return (
    <div className={`p-6 rounded-lg border-2 ${
      isMatch 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start space-x-3">
        {isMatch ? (
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${
            isMatch ? 'text-green-800' : 'text-red-800'
          }`}>
            {isMatch ? 'Match Found!' : 'Not a Match'}
          </h3>
          
          <p className={`mt-2 ${
            isMatch ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.message}
          </p>
          
          <div className="flex items-center space-x-1 mt-3 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Analyzed at {result.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};