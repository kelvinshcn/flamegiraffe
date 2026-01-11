"use client";

import { FlameGraphNode } from "@/lib/flamegraph";
import { useMemo, useState } from "react";

interface Props {
    data: FlameGraphNode;
    width?: number;
    height?: number;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    node: FlameGraphNode;
    color: string;
}

function stringToColor(str: string) {
    if (str === "root") return "#ddd";
    if (str === "all") return "#ddd";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Warm colors for flamegraphs usually: red/orange/yellow
    // But pprof uses random colors. Let's do random consistent colors.
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 60%)`;
}

export default function FlameGraph({ data, width = 1200, height = 600 }: Props) {
    const [focusedNode, setFocusedNode] = useState<FlameGraphNode>(data);
    const [hoveredNode, setHoveredNode] = useState<FlameGraphNode | null>(null);

    // Layout calculation
    const rects = useMemo(() => {
        const list: Rect[] = [];
        const ROW_HEIGHT = 16;

        // We render based on the *focused* node as the root of the view
        // But we might want to show the context (parents) or just the subtree.
        // For simplicity, let's just zoom into the subtree.

        // Total value for width calculation is the focused node's value.
        const totalValue = focusedNode.value;
        if (totalValue === 0) return [];

        const scale = width / totalValue;

        function traverse(node: FlameGraphNode, x: number, depth: number) {
            const w = node.value * scale;
            if (w < 1) return; // Don't render if less than 1px

            list.push({
                x,
                y: depth * ROW_HEIGHT,
                width: w,
                height: ROW_HEIGHT - 1,
                node,
                color: stringToColor(node.name)
            });

            // Children
            let currentX = x;
            // Sort children by name for consistent ordering (already done in parser usually)
            for (const child of node.children) {
                traverse(child, currentX, depth + 1);
                currentX += child.value * scale;
            }
        }

        traverse(focusedNode, 0, 0);
        return list;
    }, [focusedNode, width]);

    return (
        <div className="flex flex-col gap-4">
            <div className="p-2 bg-gray-100 rounded text-sm h-12 flex items-center">
                {hoveredNode ? (
                    <span>
                        <span className="font-bold">{hoveredNode.name}</span>
                        <span className="ml-2 text-gray-600">
                            ({hoveredNode.value.toLocaleString()} samples, {((hoveredNode.value / data.value) * 100).toFixed(2)}%)
                        </span>
                    </span>
                ) : (
                    <span className="text-gray-400">Hover over a block to see details</span>
                )}
            </div>

            <div className="relative border border-gray-300 overflow-hidden" style={{ width, height }}>
                {focusedNode !== data && (
                    <button
                        onClick={() => setFocusedNode(data)}
                        className="absolute top-2 left-2 z-10 bg-white/90 border px-2 py-1 text-xs rounded hover:bg-gray-100"
                    >
                        Reset Zoom
                    </button>
                )}
                <svg width={width} height={height} className="block">
                    {rects.map((r, i) => (
                        <g key={i}>
                            <title>{r.node.name} ({r.node.value})</title>
                            <rect
                                x={r.x}
                                y={height - r.y - r.height} // Flip Y to have root at bottom (Iceicle graph is top-down, Flamegraph is bottom-up)
                                // Brendan Gregg's flamegraphs are bottom-up.
                                // Let's implement standard Flamegraph (root at bottom).
                                // height is the container height.
                                // y starts at 0 (root).
                                // So y position is (height - r.y - r.height).
                                width={r.width}
                                height={r.height}
                                fill={r.color}
                                className="hover:opacity-80 cursor-pointer transition-opacity"
                                onClick={() => setFocusedNode(r.node)}
                                onMouseEnter={() => setHoveredNode(r.node)}
                                onMouseLeave={() => setHoveredNode(null)}
                            />
                        </g>
                    ))}
                </svg>
            </div>
            <div className="text-xs text-gray-500">
                Click a frame to zoom in. Click "Reset Zoom" to reset.
            </div>
        </div>
    );
}
