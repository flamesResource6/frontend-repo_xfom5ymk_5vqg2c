import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function StoryManager({ onSelect }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", author: "" });
  const [error, setError] = useState("");

  async function load() {
    if (!API_BASE) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stories`);
      const data = await res.json();
      setStories(data);
    } catch (e) {
      setError("Failed to load stories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [API_BASE]);

  async function createStory(e) {
    e.preventDefault();
    if (!API_BASE) {
      setError("Backend URL not configured. Set VITE_BACKEND_URL.");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setForm({ title: "", author: "" });
      await load();
    } catch (e) {
      setError("Could not create story");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white text-xl font-semibold">Stories</h2>
        <p className="text-blue-200/70 text-sm">Select a story or create a new one</p>
      </div>

      <form onSubmit={createStory} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          className="bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-white"
          placeholder="Story title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          className="bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-white"
          placeholder="Author (optional)"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
        />
        <button
          className="bg-blue-600 hover:bg-blue-500 transition rounded-lg px-4 py-2 text-white font-medium"
          type="submit"
        >
          Create
        </button>
      </form>

      {error && <p className="text-red-300 text-sm">{error}</p>}

      <div className="space-y-2 max-h-56 overflow-auto pr-1">
        {loading && <p className="text-blue-200">Loading...</p>}
        {stories.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="w-full text-left bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg px-4 py-3 text-white"
          >
            <div className="font-medium">{s.title}</div>
            {s.author && <div className="text-xs text-blue-300/80">by {s.author}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
