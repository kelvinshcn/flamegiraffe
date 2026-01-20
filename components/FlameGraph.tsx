"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { flamegraph } from "d3-flame-graph";
import "d3-flame-graph/dist/d3-flamegraph.css";
import { FlameGraphNode } from "@/lib/flamegraph";

interface Props {
  data: FlameGraphNode;
  width?: number;
  height?: number;
}

export default function FlameGraph({ data, width = 1200, height = 600 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Clear previous graph
    containerRef.current.innerHTML = "";

    const chart = flamegraph()
      .width(width)
      .height(height)
      .tooltip(true); // Enable tooltip

    // Select the container and render the chart
    // We cast to any because d3-flame-graph types might be tricky with exact d3 versions
    d3.select(containerRef.current)
      .datum(data)
      .call(chart as any);

  }, [data, width, height]);

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef} 
        className="border rounded-xl shadow-sm bg-white overflow-hidden"
      />
      <div className="text-xs text-gray-500">
        Click a frame to zoom in. Click root to reset zoom.
      </div>
    </div>
  );
}
