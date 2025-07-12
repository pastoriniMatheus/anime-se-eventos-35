
import React from 'react';
import { Zap, Target } from 'lucide-react';

interface LeadSyncLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const LeadSyncLogo: React.FC<LeadSyncLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent rounded-2xl"></div>
        
        {/* Main icons */}
        <div className="relative z-10 flex items-center justify-center">
          <Target className="w-1/2 h-1/2 text-white absolute animate-pulse" />
          <Zap className="w-3/5 h-3/5 text-yellow-300 relative z-20" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-2xl blur-sm"></div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight`}>
            LeadSync
          </h1>
          <p className="text-xs text-gray-600 font-medium tracking-wide">
            Automação Inteligente
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadSyncLogo;
