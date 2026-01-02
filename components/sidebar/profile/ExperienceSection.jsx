"use client";

import { useState } from "react";
import ExperienceItem from "../lists/ExperienceItem";

export default function ExperienceSection() {
  const [expandedExp, setExpandedExp] = useState(null);

  // Dummy experience data
  const [experience, setExperience] = useState([
    {
      title: "Frontend Developer",
      company: "Chill",
      duration: "Jan 2023 - Present",
      location: "Remote",
      employmentType: "Full-time",
      description: "Working on scalable UI components and improving UX.",
      skills: ["React", "Next.js", "Tailwind"],
    },
    {
      title: "UI Designer",
      company: "Creative Studio",
      duration: "Jun 2021 - Dec 2022",
      location: "Dhaka, Bangladesh",
      employmentType: "Contract",
      description: "Designed clean and responsive UI/UX for clients.",
      skills: ["Figma", "Adobe XD", "Photoshop"],
    },
  ]);

  const deleteExperience = (index) => {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full mt-4">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Experience</h3>
        <button
          className="px-3 py-1 text-xs font-semibold rounded-lg text-white"
          style={{ backgroundColor: "#3EB489" }}
        >
          + Add
        </button>
      </div>

      {/* Experience List */}
      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
        {experience.map((exp, index) => (
          <ExperienceItem
            key={index}
            exp={exp}
            index={index}
            expandedExp={expandedExp}
            setExpandedExp={setExpandedExp}
            onEdit={() => console.log("Edit", index)}
            onDelete={deleteExperience}
          />
        ))}
      </div>
    </div>
  );
}
