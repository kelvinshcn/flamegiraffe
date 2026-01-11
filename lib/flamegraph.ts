export interface FlameGraphNode {
    name: string;
    value: number; // Total value (inclusive of children)
    children: FlameGraphNode[];
}

export function parseFoldedStacks(data: string): FlameGraphNode {
    const root: FlameGraphNode = {
        name: "root",
        value: 0,
        children: [],
    };

    const lines = data.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Last part is the count, everything before is the stack
        const lastSpaceIndex = trimmed.lastIndexOf(" ");
        if (lastSpaceIndex === -1) continue;

        const stackStr = trimmed.substring(0, lastSpaceIndex);
        const countStr = trimmed.substring(lastSpaceIndex + 1);
        const count = parseInt(countStr, 10);

        if (isNaN(count)) continue;

        const parts = stackStr.split(";");
        let currentNode = root;
        currentNode.value += count;

        for (const part of parts) {
            if (!part) continue;

            let child = currentNode.children.find((c) => c.name === part);
            if (!child) {
                child = {
                    name: part,
                    value: 0,
                    children: [],
                };
                currentNode.children.push(child);
            }
            currentNode = child;
            currentNode.value += count;
        }
    }

    // Sort children by value descending (optional, but often good for flamegraphs)
    // or keeping them alphabetical? Standard flamegraph sorts alphabetically or by timeline.
    // "Icicle graph" implies top-down.
    // Standard Flamegraph: x-axis is population, sorted alphabetically usually to merge frames.
    // Pprof sorts by value I think.
    // Let's sort to ensure deterministic processing.
    sortChildren(root);

    return root;
}

function sortChildren(node: FlameGraphNode) {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.children.forEach(sortChildren);
}
