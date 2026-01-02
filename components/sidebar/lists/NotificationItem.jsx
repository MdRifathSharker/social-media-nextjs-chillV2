"use client";

export default function NotificationItem({ text, time }) {
  return (
    <div
      className="flex flex-col p-3 rounded-lg cursor-pointer transition border-l-4"
      style={{ borderColor: '#3EB489' }} // primary color outline
    >
      <span className="text-sm font-medium">{text}</span>
      <span className="text-xs opacity-70 mt-1">{time}</span>
    </div>
  );
}
