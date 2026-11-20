import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
}

// Backend Modul 4 (MLBB shop) tidak punya /api/posts, jadi pakai API publik ini.
// Ganti ke http://localhost:3000/api/posts kalau backend dengan route posts sudah nyala.
const API_URL = "https://jsonplaceholder.typicode.com/posts";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // loading diturunkan dari query yang sudah selesai, bukan state terpisah
  const loading = loaded !== search;
  const visibleError = loaded === search ? error : null;

  useEffect(() => {
    const controller = new AbortController();
    // jsonplaceholder memfilter lewat title_like, bukan ?search=.
    const query = search ? `?title_like=${encodeURIComponent(search)}` : "";

    fetch(API_URL + query, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<Post[]>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setPosts(data);
        setError(null);
        setLoaded(search);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Gagal mengambil data");
        setLoaded(search);
      });

    return () => controller.abort();
  }, [search]);

  const addPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, userId: 1 }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const created: Post = await res.json();
      // ponytail: API publik selalu balas id 101, jadi id lokal dibuat unik
      const id = posts.some((p) => p.id === created.id) ? Date.now() : created.id;
      setPosts([{ ...created, id }, ...posts]);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim post");
    }
  };

  const deletePost = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus post");
    }
  };

  return (
    <section>
      <form onSubmit={addPost}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul post" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Isi post" />
        <button type="submit">Kirim</button>
      </form>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari post..."
      />

      {loading && <p>Memuat data...</p>}
      {visibleError && <p style={{ color: "red" }}>Error: {visibleError}</p>}

      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong>
            <p>{p.body}</p>
            <button onClick={() => deletePost(p.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
