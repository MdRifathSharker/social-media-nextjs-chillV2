// components/othersprofile/OtherExperienceSection.jsx
"use client";

import { useState } from "react";
import OtherExperienceItem from "./OtherExperienceItem";

export default function OtherExperienceSection({ experience }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-text dark:text-text-dark">
          Experiences
        </h3>
        {experience.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 dark:bg-accent/10 
                          text-primary dark:text-accent">
            {experience.length} {experience.length === 1 ? 'Experience' : 'Experiences'}
          </span>
        )}
      </div>

      {/* Scrollable Experiences List - শুধুমাত্র ২+ Experience থাকলে স্ক্রল হবে */}
      <div className={`flex-1 ${experience.length >= 2 ? 'overflow-y-auto pr-2' : ''}`}>
        {experience.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No experiences added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <OtherExperienceItem 
                key={exp.id || index} 
                exp={exp} 
                isExpanded={expandedId === (exp.id || index)}
                onToggle={() => toggleExpand(exp.id || index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}