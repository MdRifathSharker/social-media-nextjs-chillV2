import NotificationItem from "./lists/NotificationItem";

export default function NotificationSection() {
  return (
    <div className="space-y-2">
      <NotificationItem
        text="Alice liked your post"
        time="2 minutes ago"
      />
      <NotificationItem
        text="Alice liked your post"
        time="2 minutes ago"
      />
    </div>
  );
}
