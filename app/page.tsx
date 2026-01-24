"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { parseFoldedStacks, FlameGraphNode } from "@/lib/flamegraph";

const FlameGraph = dynamic(() => import("@/components/FlameGraph"), { ssr: false });

export default function Home() {
  const [data, setData] = useState<FlameGraphNode | null>(null);
  const [loading, setLoading] = useState(false);
  const loadExample = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/flamegiraffe/example.txt");
      if (!res.ok) throw new Error("Failed to load example");
      const text = await res.text();
      const root = parseFoldedStacks(text);
      setData(root);
    } catch (e) {
      console.error(e);
      alert("Failed to load example");
    } finally {
      setLoading(false);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        try {
          const root = parseFoldedStacks(ev.target.result);
          setData(root);
        } catch (e) {
          console.error(e);
          alert("Failed to parse file");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Flamegraph Explorer</h1>
        <p className="text-gray-500">
          Upload a folded stack file or run the example to see it in action.
        </p>
      </header>

      {!data ? (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center w-full hover:bg-gray-50 transition-colors">
              <input
                type="file"
                onChange={onFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Upload File
              </label>
              <div className="mt-4 text-sm text-gray-500">
                Supports folded stack format (e.g. <code className="bg-gray-100 px-1 rounded text-xs">func;child 10</code>)
              </div>
            </div>

            <div className="flex items-center w-full">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">or</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <button
              onClick={loadExample}
              disabled={loading}
              className="w-full py-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>Run Example Flamegraph</span>
                  <span className="text-gray-400">&rarr;</span>
                </>
              )}
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
