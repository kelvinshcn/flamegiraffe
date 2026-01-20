"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { parseFoldedStacks, FlameGraphNode } from "@/lib/flamegraph";

const FlameGraph = dynamic(() => import("@/components/FlameGraph"), { ssr: false });

export default function Home() {
  const [data, setData] = useState<FlameGraphNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleProcess = useCallback(() => {
    if (!inputText) return;
    setLoading(true);
    // Use timeout to allow UI to update
    setTimeout(() => {
      try {
        const root = parseFoldedStacks(inputText);
        setData(root);
      } catch (e) {
        console.error(e);
        alert("Failed to parse data");
      } finally {
        setLoading(false);
      }
    }, 10);
  }, [inputText]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setInputText(ev.target.result);
        // Auto process?
        // Let's settle for setting text first so user can edit if needed
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Flamegraph Explorer</h1>
        <p className="text-gray-500">
          Paste your folded stack traces (Ex: <code className="bg-gray-100 px-1 rounded">func;child 10</code>) below or upload a file.
        </p>
      </header>

      {!data ? (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
            <input
              type="file"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Upload File
            </label>
            <div className="mt-2 text-sm text-gray-400">or paste content below</div>
          </div>

          <div>
            <textarea
              ref={inputRef}
              className="w-full h-64 p-4 border rounded-xl font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="root;child;grandchild 100&#10;root;child;sibling 50..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleProcess}
              disabled={!inputText || loading}
              className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Processing..." : "Generate Flamegraph"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setData(null)}
              className="text-sm text-gray-600 hover:text-black underline"
            >
              &larr; Upload new data
            </button>
            <div className="text-sm text-gray-500">
              Total samples: {data.value.toLocaleString()}
            </div>
          </div>

          <div className="border rounded-xl shadow-sm p-4 bg-white overflow-hidden">
            <FlameGraph data={data} width={1200} height={600} />
          </div>
        </div>
      )}
    </div>
  );
}
