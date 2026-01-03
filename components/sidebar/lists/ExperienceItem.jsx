//components/sidebar/lists/ExperienceItem.jsx
"use client";

export default function ExperienceItem({
  exp,
  index,
  expandedExp,
  setExpandedExp,
  onEdit,
  onDelete,
}) {
  const isExpanded = expandedExp === index;

  return (
    <div
      className="p-3 rounded-lg border-l-4 border-primary dark:border-accent
      bg-gradient-to-br from-blue-50 to-white
      dark:from-gray-800 dark:to-gray-900
      hover:shadow-md transition"
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-text dark:text-text-dark">
            {exp.title}
          </p>
          <p className="text-xs text-primary dark:text-accent font-semibold">
            {exp.company}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {exp.duration}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Expand */}
          <button
            onClick={() => setExpandedExp(isExpanded ? null : index)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-primary/10 dark:hover:bg-accent/20 transition"
            title="View details"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(index)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-primary/10 dark:hover:bg-accent/20 transition"
            title="Edit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 4h2m2 2l4 4-10 10H5v-4L15 6z"
              />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(index)}
            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7h12M9 7V5h6v2m-7 4v6m4-6v6m4-6v6M5 7l1 14h12l1-14"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-semibold">
            {exp.location && exp.location}
            {exp.location && exp.employmentType && " • "}
            {exp.employmentType}
          </p>

          {exp.description && (
            <p className="mt-2 whitespace-pre-line">{exp.description}</p>
          )}

          {exp.skills && exp.skills.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {exp.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs bg-primary dark:bg-accent text-white px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}