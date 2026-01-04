"use client";

export default function ProfileInfo({ profileData }) {
  return (
    <div className="space-y-4">
      {profileData.contact && (
        <div>
          <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
            Contact:
          </span>
          <p className="text-sm">{profileData.contact}</p>
        </div>
      )}
      
      {profileData.email && (
        <div>
          <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
            Email:
          </span>
          <p className="text-sm">{profileData.email}</p>
        </div>
      )}
      
      {profileData.website && (
        <div>
          <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
            Website:
          </span>
          <p className="text-sm">{profileData.website}</p>
        </div>
      )}
      
      {profileData.location && (
        <div>
          <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
            Location:
          </span>
          <p className="text-sm">{profileData.location}</p>
        </div>
      )}
    </div>
  );
}