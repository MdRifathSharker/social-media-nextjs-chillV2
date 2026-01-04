"use client";

export default function FollowingItem({ name, avatar, headline}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
      border-2"
      style={{ borderColor: '#3EB489' }}
    >
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <span className="font-medium text-sm">{name}</span>
        <p className="text-sm text-primary dark:text-accent font-semibold text-center">{headline}</p>
      </div>
    </div>
  );
}
