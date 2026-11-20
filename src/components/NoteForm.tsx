import { useState } from "react";
import type { Note } from "../types/note";

type Props = {
  onAdd: (note: Omit<Note, "id">) => void;
};

export default function NoteForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, content, category });
    setTitle("");
    setContent("");
    setCategory("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul" />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategori" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Isi catatan" />
      <button type="submit">Tambah</button>
    </form>
  );
}