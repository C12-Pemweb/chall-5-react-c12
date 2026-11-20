import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
}

// Ganti ke http://localhost:3000/api/posts kalau backend Modul 4 sudah nyala
const API_URL = "https://jsonplaceholder.typicode.com/posts";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <strong>{p.title}</strong>
          <p>{p.body}</p>
        </li>
      ))}
    </ul>
  );
}