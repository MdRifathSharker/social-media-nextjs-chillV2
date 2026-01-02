"use client";

export default function ProfileAvatar({
  profileImageUrl,
  name = "No Name",
  headline = "",
  openImageModal,
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Avatar */}
      <div className="w-28 h-28 mb-2 relative">
        <img
          onClick={() => openImageModal?.("profile")}
          src={profileImageUrl || "/default-avatar.png"}
          alt={name}
          className="w-28 h-28 rounded-full object-cover border-4 border-primary dark:border-accent shadow-lg cursor-pointer"
        />
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold text-center">{name}</h2>

      {/* Headline */}
      {headline && (
        <p className="text-sm text-primary dark:text-accent font-semibold text-center">
          {headline}
        </p>
      )}
    </div>
  );
}
