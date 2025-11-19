import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function ChapterEditor({ story }) {
  const [chapters, setChapters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!story || !API_BASE) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/chapters?story_id=${story.id}`);
        const data = await res.json();
        setChapters(data);
        if (data.length && !selected) setSelected(data[0]);
      } catch (e) {
        setError("Failed to load chapters");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, API_BASE]);

  async function createChapter(e) {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story_id: story.id, title: newChapterTitle, order: chapters.length })
      });
      if (!res.ok) throw new Error();
      setNewChapterTitle("");
      const list = await (await fetch(`${API_BASE}/api/chapters?story_id=${story.id}`)).json();
      setChapters(list);
    } catch (e) {
      setError("Could not create chapter");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Chapters</h3>
        </div>
        <form onSubmit={createChapter} className="flex gap-2">
          <input
            className="flex-1 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-white"
            placeholder="New chapter title"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
          />
          <button className="bg-blue-600 hover:bg-blue-500 transition rounded-lg px-4 py-2 text-white">
            Add
          </button>
        </form>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {loading && <p className="text-blue-200">Loading...</p>}
          {chapters.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left rounded-lg px-4 py-2 border ${
                selected?.id === c.id
                  ? "bg-blue-600/30 border-blue-500 text-white"
                  : "bg-slate-800/60 border-slate-700 text-blue-100"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        {selected ? (
          <BubbleEditor key={selected.id} chapter={selected} />
        ) : (
          <div className="text-blue-200/80">Select a chapter to edit bubbles</div>
        )}
      </div>
    </div>
  );
}

function BubbleEditor({ chapter }) {
  const [bubbles, setBubbles] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function load() {
    if (!API_BASE) return;
    const res = await fetch(`${API_BASE}/api/bubbles?chapter_id=${chapter.id}`);
    const data = await res.json();
    setBubbles(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  async function addBubble(e) {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/bubbles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: chapter.id,
          content_html: content,
          order: bubbles.length,
        }),
      });
      if (!res.ok) throw new Error();
      setContent("");
      await load();
    } catch (e) {
      setError("Could not add bubble");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addBubble} className="space-y-2">
        <RichTextEditor value={content} onChange={setContent} />
        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-500 transition rounded-lg px-4 py-2 text-white">
            Add bubble
          </button>
          {error && <span className="text-red-300 text-sm">{error}</span>}
        </div>
      </form>

      <div className="space-y-3">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-blue-100 shadow-lg"
            >
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: b.content_html }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToolbarButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-sm font-medium border ${
        active
          ? "bg-blue-600/30 border-blue-500 text-white"
          : "bg-slate-800/60 border-slate-700 text-blue-100 hover:bg-slate-700/60"
      }`}
    >
      {children}
    </button>
  );
}

function RichTextEditor({ value, onChange }) {
  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    onChange(editorRef.current.innerHTML);
  };

  const editorRef = useMemo(() => ({ current: null }), []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [editorRef, value]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
      <div className="flex flex-wrap gap-2 p-2 border-b border-slate-800">
        <ToolbarButton onClick={() => exec("bold")}>Bold</ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")}>Italic</ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")}>Underline</ToolbarButton>
        <ToolbarButton onClick={() => exec("insertUnorderedList")}>• List</ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")}>1. List</ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<h3>")}>H3</ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<p>")}>P</ToolbarButton>
        <ToolbarButton onClick={() => exec("createLink", prompt("Enter URL"))}>Link</ToolbarButton>
      </div>
      <div
        ref={(el) => (editorRef.current = el)}
        className="min-h-[120px] p-3 outline-none prose prose-invert max-w-none"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        suppressContentEditableWarning
        placeholder="Write bubble content..."
      />
    </div>
  );
}
