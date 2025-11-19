import { useState } from "react";
import { motion } from "framer-motion";
import StoryManager from "./components/StoryManager";
import ChapterEditor from "./components/ChapterEditor";

function App() {
  const [selectedStory, setSelectedStory] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.12),transparent_40%)]" />

      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-sm bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" alt="Flames" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-white">Bubble Stories</h1>
          </div>
          <div className="text-blue-300/80 text-sm">
            {import.meta.env.VITE_BACKEND_URL ? "Connected" : "Set VITE_BACKEND_URL"}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <StoryManager onSelect={setSelectedStory} />
          </div>

          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            {selectedStory ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-white text-2xl font-semibold">{selectedStory.title}</h2>
                  {selectedStory.author && (
                    <p className="text-blue-300/80 text-sm">by {selectedStory.author}</p>
                  )}
                </div>
                <ChapterEditor story={selectedStory} />
              </div>
            ) : (
              <div className="text-blue-200/80">Pick a story to manage chapters and bubbles</div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
