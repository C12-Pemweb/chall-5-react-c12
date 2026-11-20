import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
}

// Backend Modul 4: jalankan `npm run dev` di pweb-express-c12-2026 (port 3000).
const API_URL = "http://localhost:3000/api/posts";

// Backend membalas { status, message, data, metadata }, bukan array langsung.
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

async function readJson<T>(res: Response): Promise<T> {
  const payload = (await res.json()) as ApiResponse<T> & { message?: string };
  if (!res.ok) throw new Error(payload.message ?? `Server error: ${res.status}`);
  return payload.data;
}

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
    const query = `?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`;

    fetch(API_URL + query, { signal: controller.signal })
      .then((res) => readJson<Post[]>(res))
      .then((data) => {
        if (controller.signal.aborted) return;
        setPosts(data);
        setError(null);
        setLoaded(search);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof TypeError
            ? "Tidak bisa terhubung ke server (http://localhost:3000)"
            : err instanceof Error
              ? err.message
              : "Gagal mengambil data",
        );
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
        body: JSON.stringify({ title, body }),
      });
      const created = await readJson<Post>(res);
      setPosts([created, ...posts]);
      setError(null);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim post");
    }
  };

  const deletePost = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      await readJson<Post>(res);
      setPosts(posts.filter((p) => p.id !== id));
      setError(null);
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
      {!loading && !visibleError && posts.length === 0 && <p>Belum ada post.</p>}

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
