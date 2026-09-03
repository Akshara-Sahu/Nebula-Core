"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface VisGraphProps {
  content: string;
}

export default function VisGraph({ content }: VisGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let networkInstance: any = null;

    const initNetwork = async () => {
      try {
        setLoading(true);
        // Parse the input configuration JSON
        const parsed = JSON.parse(content);
        
        if (!parsed.nodes || !parsed.edges) {
          throw new Error("JSON structure must contain 'nodes' and 'edges' arrays.");
        }
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error("'nodes' and 'edges' must be arrays.");
        }

        // Dynamically import vis-network to run client-side only
        const vis = await import("vis-network/standalone");
        
        if (!active || !containerRef.current) return;

        setError(null);
        setLoading(false);

        // Map parsed nodes and apply premium visual styles
        const nodes = (parsed.nodes as Record<string, unknown>[]).map((node) => {
          const colorVal = (node.color as string) || "#8b5cf6";
          return {
            id: node.id as number,
            label: node.label as string,
            shape: "dot",
            size: 24,
            font: {
              color: "#f4f4f5",
              size: 14,
              face: "var(--font-sans), system-ui, sans-serif",
              strokeWidth: 4,
              strokeColor: "#09090b",
            },
            color: {
              background: colorVal,
              border: "#09090b",
              highlight: {
                background: "#ffffff",
                border: colorVal,
              },
              hover: {
                background: colorVal,
                border: "#ffffff",
              },
            },
            borderWidth: 2.5,
            shadow: {
              enabled: true,
              color: "rgba(0, 0, 0, 0.5)",
              size: 8,
              x: 0,
              y: 4,
            },
          };
        });

        // Map parsed edges and apply premium visual styles
        const edges = (parsed.edges as Record<string, unknown>[]).map((edge) => {
          return {
            from: edge.from as number,
            to: edge.to as number,
            label: (edge.label as string) || "",
            font: {
              color: "#a1a1aa",
              size: 11,
              face: "var(--font-mono), monospace",
              align: "top",
              strokeWidth: 0,
            },
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 0.65,
              },
            },
            color: {
              color: "#27272a",
              highlight: "#8b5cf6",
              hover: "#22d3ee",
            },
            width: 2,
            hoverWidth: 3,
            selectionWidth: 3,
            smooth: {
              type: "cubicBezier",
              forceDirection: "none",
              roundness: 0.45,
            },
          };
        });

        const data = { nodes, edges };

        // Configuration options for vis-network physics layout and interactions
        const options = {
          physics: {
            enabled: true,
            solver: "forceAtlas2Based",
            forceAtlas2Based: {
              gravitationalConstant: -70,
              centralGravity: 0.015,
              springLength: 130,
              springConstant: 0.07,
              damping: 0.4,
              avoidOverlap: 1.0,
            },
            stabilization: {
              enabled: true,
              iterations: 120,
              fit: true,
            },
          },
          interaction: {
            hover: true,
            hoverConnectedEdges: true,
            selectConnectedEdges: true,
            dragView: true,
            zoomView: true,
            tooltipDelay: 150,
          },
        };

        // Create the Network
        networkInstance = new vis.Network(containerRef.current, data, options);

      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg || "Failed to parse or render Vis-Network.");
          setLoading(false);
        }
      }
    };

    initNetwork();

    return () => {
      active = false;
      if (networkInstance) {
        networkInstance.destroy();
      }
    };
  }, [content]);

  return (
    <div className="relative w-full h-full bg-[#09090b] flex items-center justify-center p-2 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#09090b] text-muted-foreground z-10">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-xs font-mono">Simulating network graph...</span>
        </div>
      )}

      {error ? (
        <div className="glass-accent rounded-xl border border-destructive/20 p-5 max-w-lg text-left glow-accent m-4 z-20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground font-mono">vis.js Network JSON Error</h4>
              <p className="mt-2 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-40 overflow-x-auto">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full min-h-[300px]" />
      )}
    </div>
  );
}
