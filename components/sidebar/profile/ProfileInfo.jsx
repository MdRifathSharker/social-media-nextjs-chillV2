"use client";

export default function ProfileInfo({ profileData }) {
  return (
    <div className="flex flex-col gap-3 w-full text-sm mb-4">
      <InfoRow label="Email" value={profileData.email} />
      <InfoRow label="Website" value={profileData.website} />
      <InfoRow label="Location" value={profileData.location} />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="font-semibold text-primary dark:text-accent">
        {label}:
      </span>
      <p className="text-xs">{value}</p>
    </div>
  );
}
