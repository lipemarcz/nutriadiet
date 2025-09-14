import React from 'react';
import { CardProps } from '../types';

/**
 * Reusable Card component with dark mode support
 * Provides consistent styling for content containers
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  isDarkMode = false,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  ...props
}) => {
  // Base card classes
  const baseClasses = 'rounded-lg border transition-all duration-200 shadow-sm';
  
  // Theme classes
  const themeClasses = isDarkMode
    ? 'bg-surface border-border text-foreground'
    : 'bg-white border-gray-200 text-gray-900';
  
  // Padding classes
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };
  
  // Shadow classes
  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  // Combine all classes
  const cardClasses = `${baseClasses} ${themeClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;
  
  return (
    <div className={cardClasses} {...props}>
      {/* Card Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-[#c9d1d9]' : 'text-gray-900'
            }`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-[#9aa4b2]' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
