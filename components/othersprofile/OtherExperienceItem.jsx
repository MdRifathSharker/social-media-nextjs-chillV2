// components/othersprofile/OtherExperienceItem.jsx
"use client";

import { useState } from "react";

export default function OtherExperienceItem({ exp, isExpanded, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Description ট্রান্কেট করার জন্য
  const maxLength = 150;
  const shouldTruncate = exp.description && exp.description.length > maxLength && !isExpanded;
  const displayDescription = shouldTruncate 
    ? exp.description.substring(0, maxLength) + '...' 
    : exp.description;

  return (
    <div 
      className={`p-4 rounded-lg border-l-4 border-primary/40 dark:border-accent/40
        bg-gradient-to-br from-blue-50/50 to-white/50
        dark:from-gray-800/50 dark:to-gray-900/50
        hover:shadow-md transition-all duration-300 mb-3 cursor-pointer
        ${isHovered ? 'shadow-sm' : ''}`}
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section - সবসময় দেখা যাবে */}
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-text dark:text-text-dark">
              {exp.title}
            </p>
            <p className="text-sm text-primary dark:text-accent font-medium">
              {exp.company}
            </p>
          </div>
          
          {/* Expand/Collapse Indicator */}
          {exp.description && exp.description.length > maxLength && (
            <button 
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent
                       ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Duration and Location - সবসময় দেখা যাবে */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
            {exp.end_date ? 
              ` - ${new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 
              exp.currently_working ? ' - Present' : ''}
          </span>
        </div>
        
        {exp.location && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{exp.location}</span>
          </div>
        )}
        
        {exp.employment_type && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{exp.employment_type}</span>
          </div>
        )}
      </div>

      {/* Description - কলাপ্স/এক্সপান্ড হবে */}
      {exp.description && (
        <div className="transition-all duration-300">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
            {displayDescription}
          </p>
          
          {shouldTruncate && (
            <button 
              className="text-xs text-primary dark:text-accent font-medium hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              Read {isExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {/* Skills - কলাপ্স/এক্সপান্ডের সাথে সাথে দেখা যাবে */}
      {exp.skills && exp.skills.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 mt-3 transition-all duration-300 ${!isExpanded ? 'opacity-90' : ''}`}>
          {exp.skills.map((skill, i) => (
            <span
              key={i}
              className="text-xs bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent 
                         px-3 py-1 rounded-full border border-primary/20 dark:border-accent/20"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}