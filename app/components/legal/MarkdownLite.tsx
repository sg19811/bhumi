// Minimal, dependency-free markdown renderer for article bodies.
// Handles: ## / ### headings, - bullets, and paragraphs. Good enough for
// curated FAQ content; escape-safe because we only render text nodes.
import React from "react";

export default function MarkdownLite({ md }: { md: string }) {
  const blocks = md.trim().split(/\n{2,}/);
  return (
    <div className="space-y-4 leading-relaxed text-gray-700">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="list-inside list-disc space-y-1.5">
              {lines.map((l, j) => <li key={j}>{l.replace(/^\s*-\s+/, "")}</li>)}
            </ul>
          );
        }
        const h = block.match(/^(#{2,3})\s+(.*)$/);
        if (h) {
          const level = h[1].length;
          const text = h[2];
          return level === 2
            ? <h2 key={i} className="pt-2 text-xl font-bold text-gray-900">{text}</h2>
            : <h3 key={i} className="text-lg font-semibold text-gray-900">{text}</h3>;
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}
