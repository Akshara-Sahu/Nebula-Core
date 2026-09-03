"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { AlertCircle } from "lucide-react";

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  size?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  value: number;
}

interface D3VisualizationProps {
  content: string;
}

export default function D3Visualization({ content }: D3VisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    let simulation: d3.Simulation<D3Node, D3Link> | null = null;
    let active = true;

    // Clear previous drawing
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const setupD3 = () => {
      try {
        // 1. Safe evaluation of JavaScript configuration to retrieve graphData
        const fn = new Function(`
          ${content};
          if (typeof graphData !== "undefined") {
            return graphData;
          }
          return null;
        `);
        
        const parsedData = fn();

        if (!parsedData) {
          throw new Error("Could not find global variable 'graphData' defined in code.");
        }
        if (!Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.links)) {
          throw new Error("'graphData' must contain 'nodes' and 'links' arrays.");
        }

        setError(null);

        // Deep copy nodes and links to prevent side-effects from D3 mutations
        const nodes: D3Node[] = (parsedData.nodes as Record<string, unknown>[]).map((n) => ({
          id: String(n.id),
          group: Number(n.group || 1),
          size: n.size ? Number(n.size) : 20,
        }));

        const links: D3Link[] = (parsedData.links as Record<string, unknown>[]).map((l) => ({
          source: String(l.source),
          target: String(l.target),
          value: Number(l.value || 1),
        }));

        // Setup container dimensions
        const width = containerRef.current!.clientWidth || 600;
        const height = containerRef.current!.clientHeight || 500;

        // Make SVG responsive
        svgElement
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("viewBox", `0 0 ${width} ${height}`)
          .style("background-color", "#09090b");

        // Define patterns and definitions for glow effect
        const defs = svgElement.append("defs");
        
        // Node Glow filter
        const filter = defs.append("filter")
          .attr("id", "glow")
          .attr("x", "-30%")
          .attr("y", "-30%")
          .attr("width", "160%")
          .attr("height", "160%");
        
        filter.append("feGaussianBlur")
          .attr("stdDeviation", "6")
          .attr("result", "blur");
        
        filter.append("feComposite")
          .attr("in", "SourceGraphic")
          .attr("in2", "blur")
          .attr("operator", "over");

        // Root group supporting Zoom
        const zoomG = svgElement.append("g");

        // Zoom configuration
        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 8])
          .on("zoom", (event) => {
            zoomG.attr("transform", event.transform);
          });

        svgElement.call(zoomBehavior);

        // Curated HSL colors matching dashboard theme
        const getColor = (group: number) => {
          const palettes: Record<number, string> = {
            1: "#a855f7", // Purple
            2: "#22d3ee", // Cyan
            3: "#ec4899", // Pink
            4: "#eab308", // Yellow
            5: "#10b981", // Emerald
          };
          return palettes[group] || palettes[1];
        };

        // Draw links
        const link = zoomG.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(links)
          .enter()
          .append("line")
          .attr("stroke", "#27272a")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", (d) => Math.sqrt(d.value) * 1.5 + 1);

        // Draw nodes
        const node = zoomG.append("g")
          .attr("class", "nodes")
          .selectAll("g")
          .data(nodes)
          .enter()
          .append("g")
          .call(
            d3.drag<SVGGElement, D3Node>()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );

        // Visual Node Base Circle
        node.append("circle")
          .attr("r", (d) => d.size || 20)
          .attr("fill", (d) => getColor(d.group))
          .attr("fill-opacity", 0.85)
          .attr("stroke", "#09090b")
          .attr("stroke-width", 2)
          .style("filter", "url(#glow)")
          .style("cursor", "grab");

        // Add a smaller concentric inner ring for premium feel
        node.append("circle")
          .attr("r", (d) => Math.max(4, (d.size || 20) * 0.4))
          .attr("fill", "#ffffff")
          .attr("fill-opacity", 0.3)
          .attr("pointer-events", "none");

        // Node text labels
        node.append("text")
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .attr("fill", "#f4f4f5")
          .style("font-family", "var(--font-sans), sans-serif")
          .style("font-weight", "600")
          .style("font-size", (d) => Math.max(9, (d.size || 20) * 0.5) + "px")
          .style("pointer-events", "none")
          .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
          .text((d) => d.id);

        // Physics force simulation
        simulation = d3.forceSimulation<D3Node>(nodes)
          .force("link", d3.forceLink<D3Node, D3Link>(links).id((d) => d.id).distance(90))
          .force("charge", d3.forceManyBody().strength(-200))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collision", d3.forceCollide<D3Node>().radius((d) => (d.size || 20) + 12));

        simulation.on("tick", () => {
          link
            .attr("x1", (d) => (d.source as D3Node).x ?? 0)
            .attr("y1", (d) => (d.source as D3Node).y ?? 0)
            .attr("x2", (d) => (d.target as D3Node).x ?? 0)
            .attr("y2", (d) => (d.target as D3Node).y ?? 0);

          node.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
        });

        // Drag functions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function dragstarted(event: any, d: D3Node) {
          if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function dragged(event: any, d: D3Node) {
          d.fx = event.x;
          d.fy = event.y;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function dragended(event: any, d: D3Node) {
          if (!event.active && simulation) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg || "JavaScript Runtime/Parsing Error.");
        }
      }
    };

    const timer = setTimeout(setupD3, 0);

    return () => {
      active = false;
      clearTimeout(timer);
      if (simulation) {
        simulation.stop();
      }
    };
  }, [content]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-[#09090b] overflow-hidden">
      {error ? (
        <div className="glass-accent rounded-xl border border-destructive/20 p-5 max-w-lg text-left glow-accent m-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground font-mono">D3 Compilation Error</h4>
              <p className="mt-2 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-40 overflow-x-auto">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full transition-opacity duration-300" />
      )}
    </div>
  );
}
