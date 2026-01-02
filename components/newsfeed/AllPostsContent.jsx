import Post from "@/components/post";

export default function AllPostsContent() {
  return (
    <div className="space-y-4">
      <Post
        name="Alice"
        username="@alice123"
        image="https://picsum.photos/500/300"
        caption="Hello, this is my first post!"
      />
      <Post
        name="Bob"
        username="@bob456"
        image="https://picsum.photos/500/301"
        caption="Loving this new platform!"
      />
      {/* Add more posts */}
    </div>
  );
}
