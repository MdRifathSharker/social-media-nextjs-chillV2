"use client";

function ExperienceItem({ exp }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900 mb-3">
      <p className="font-semibold">{exp.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {exp.company} • {exp.start_date} - {exp.end_date || "Present"}
      </p>
      {exp.description && (
        <p className="text-sm mt-1">{exp.description}</p>
      )}
    </div>
  );
}

export default function ExperienceSection({ experience }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text dark:text-text-dark">
          Experiences
        </h3>
      </div>

      {/* Scrollable Experiences List - Takes remaining height */}
      <div className="flex-1 overflow-y-auto pr-2">
        {experience.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No experiences added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {experience.map((exp) => (
              <ExperienceItem key={exp.id} exp={exp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}