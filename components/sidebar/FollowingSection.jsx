import FollowingItem from "./lists/FollowingItem";

export default function FollowingSection() {
  return (
    <div className="space-y-2">
      <FollowingItem
        name="Alice Johnson"
        avatar="https://i.pravatar.cc/100?u=alice"
        headline="Frontend Developer"
      />
    </div>
  );
}
