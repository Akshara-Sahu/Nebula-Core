"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { AlertCircle, RefreshCw } from "lucide-react";

// Initialize mermaid
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    themeVariables: {
      background: "#09090b",
      primaryColor: "#8b5cf6",
      primaryTextColor: "#f4f4f5",
      lineColor: "#27272a",
    },
  });
} catch (e) {
  console.error("Failed to initialize mermaid", e);
}

interface MermaidChartProps {
  content: string;
}

export default function MermaidChart({ content }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  
  const uniqueId = useId().replace(/:/g, "");
  const renderId = useRef(`mermaid-${uniqueId}`);

  useEffect(() => {
    let active = true;

    const renderChart = async () => {
      if (!content.trim()) {
        setError("Diagram code is empty");
        setCompiling(false);
        return;
      }

      setCompiling(true);

      try {
        // Clear any previous error
        setError(null);

        // Mermaid parser will throw an error if it's invalid syntax
        // Generate svg markup
        const { svg } = await mermaid.render(renderId.current, content);
        
        if (active) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: unknown) {
        console.warn("Mermaid compiling error cached");
        if (active) {
          const errMsg = err instanceof Error ? err.message : String(err);
          // Format the error messages
          setError(errMsg || "Mermaid Syntax Error: Check graph structure, link syntax, or nodes definition.");
        }
        
        // Clean up Mermaid's error element appended to body
        const badElement = document.getElementById(renderId.current);
        if (badElement) {
          badElement.remove();
        }
        const badBindElement = document.getElementById(`d${renderId.current}`);
        if (badBindElement) {
          badBindElement.remove();
        }
      } finally {
        if (active) {
          setCompiling(false);
        }
      }
    };

    // Debounce mermaid render slightly to feel smoother while typing
    const timer = setTimeout(() => {
      renderChart();
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [content]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#09090b] p-6 overflow-auto">
      {/* Loading Overlay */}
      {compiling && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] text-accent border border-border">
          <RefreshCw className="h-3 w-3 animate-spin text-accent" />
          <span>Rendering...</span>
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="glass-accent rounded-xl border border-destructive/20 p-5 max-w-lg text-left glow-accent">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground font-mono">Mermaid Syntax Error</h4>
              <p className="mt-2 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-40">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Chart container */
        <div
          ref={containerRef}
          className="mermaid-svg-container w-full h-full flex items-center justify-center transition-all duration-300 [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:h-auto [&>svg]:w-auto"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
}
