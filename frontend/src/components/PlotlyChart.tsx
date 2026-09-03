"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface PlotlyChartProps {
  content: string;
}

export default function PlotlyChart({ content }: PlotlyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let PlotlyInstance: any = null;
    const currentContainer = containerRef.current;

    const renderPlot = async () => {
      try {
        setLoading(true);
        // Parse the input data as JSON
        const parsed = JSON.parse(content);
        
        if (!parsed.xData || !parsed.yData) {
          throw new Error("JSON structure must contain 'xData' (array) and 'yData' (object of series).");
        }
        if (!Array.isArray(parsed.xData)) {
          throw new Error("'xData' must be an array of coordinates.");
        }
        if (typeof parsed.yData !== "object" || parsed.yData === null) {
          throw new Error("'yData' must be an object where keys are series names and values are arrays.");
        }

        // Dynamically import plotly on the client side only
        const PlotlyModule = await import("plotly.js-dist-min");
        PlotlyInstance = PlotlyModule.default || PlotlyModule;

        if (!active || !currentContainer) return;

        setError(null);
        setLoading(false);

        // Predefined color palette to ensure dashboard cohesiveness
        const palette = ["#8b5cf6", "#22d3ee", "#ec4899", "#eab308", "#10b981"];

        // Map the JSON data to Plotly traces
        const traces = Object.entries(parsed.yData as Record<string, unknown>).map(([seriesName, yValues], idx) => {
          if (!Array.isArray(yValues)) {
            throw new Error(`Series '${seriesName}' under 'yData' must be an array.`);
          }
          return {
            x: parsed.xData,
            y: yValues,
            name: seriesName,
            type: "scatter",
            mode: "lines+markers",
            line: {
              shape: "spline",
              width: 3,
              color: palette[idx % palette.length],
            },
            marker: {
              size: 8,
              color: palette[idx % palette.length],
              line: {
                color: "#09090b",
                width: 1.5,
              },
            },
          };
        });

        const layout = {
          title: {
            text: parsed.title || "Interactive Performance Analysis",
            font: {
              color: "#f4f4f5",
              family: "var(--font-sans), system-ui, sans-serif",
              size: 16,
              weight: "600",
            },
            x: 0.05,
          },
          paper_bgcolor: "#09090b",
          plot_bgcolor: "#09090b",
          xaxis: {
            gridcolor: "#18181b",
            zerolinecolor: "#27272a",
            color: "#a1a1aa",
            title: {
              text: "Input Size (N)",
              font: {
                family: "var(--font-sans), sans-serif",
                color: "#a1a1aa",
              },
            },
            tickfont: {
              family: "var(--font-mono), monospace",
              size: 10,
            },
          },
          yaxis: {
            gridcolor: "#18181b",
            zerolinecolor: "#27272a",
            color: "#a1a1aa",
            title: {
              text: "Execution Time (ms)",
              font: {
                family: "var(--font-sans), sans-serif",
                color: "#a1a1aa",
              },
            },
            tickfont: {
              family: "var(--font-mono), monospace",
              size: 10,
            },
          },
          margin: { t: 60, r: 25, l: 55, b: 50 },
          legend: {
            font: {
              color: "#f4f4f5",
              family: "var(--font-sans), sans-serif",
              size: 11,
            },
            bgcolor: "rgba(9, 9, 11, 0.6)",
            bordercolor: "#27272a",
            borderwidth: 1,
            x: 0.05,
            y: 0.95,
          },
          hovermode: "closest",
          autosize: true,
        };

        const config = {
          responsive: true,
          displayModeBar: false,
        };

        // Render chart
        await PlotlyInstance.newPlot(currentContainer, traces, layout, config);

      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg || "Failed to parse or render Plotly Chart.");
          setLoading(false);
        }
      }
    };

    renderPlot();

    // Resize handler
    const handleResize = () => {
      if (PlotlyInstance && currentContainer) {
        PlotlyInstance.Plots.resize(currentContainer);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      if (PlotlyInstance && currentContainer) {
        PlotlyInstance.purge(currentContainer);
      }
    };
  }, [content]);

  return (
    <div className="relative w-full h-full bg-[#09090b] flex items-center justify-center p-2 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#09090b] text-muted-foreground z-10">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-xs font-mono">Loading chart...</span>
        </div>
      )}

      {error ? (
        <div className="glass-accent rounded-xl border border-destructive/20 p-5 max-w-lg text-left glow-accent m-4 z-20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground font-mono">Plotly JSON Error</h4>
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
