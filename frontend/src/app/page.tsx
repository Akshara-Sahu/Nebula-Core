"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import MonacoEditor from "@/components/MonacoEditor";
import MermaidChart from "@/components/MermaidChart";
import D3Visualization from "@/components/D3Visualization";
import PlotlyChart from "@/components/PlotlyChart";
import ThreeScene from "@/components/ThreeScene";
import VisGraph from "@/components/VisGraph";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FileCode,
  Settings,
  Puzzle,
  Terminal,
  Activity,
  Code2,
  X,
  LineChart,
  Network,
  Box,
  GitFork,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from "lucide-react";

export default function Home() {
  const {
    files,
    activeFile,
    openTabs,
    sidebarTab,
    extensions,
    setActiveFile,
    closeTab,
    setSidebarTab,
    toggleExtension
  } = useStore();

  const [layoutMode, setLayoutMode] = useState<"split" | "editor" | "preview">("split");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Nebula IDE Kernel loaded successfully.",
    "Active theme: VS-Dark customized.",
    "WebGL 3D Context initialized.",
    "Zustand state bindings synchronized."
  ]);

  const currentFile = files[activeFile];

  // Helper to map file extension to extension configuration in state
  const getExtensionForFile = (filePath: string) => {
    switch (filePath) {
      case "/chart.mermaid":
        return extensions["mermaid-preview"];
      case "/d3-graph.js":
        return extensions["d3-graph"];
      case "/three-scene.js":
        return extensions["three-webgl"];
      case "/plotly-data.json":
        return extensions["plotly-builder"];
      case "/network-vis.json":
        return extensions["vis-network"];
      default:
        return null;
    }
  };

  const currentExtension = getExtensionForFile(activeFile);
  const isExtensionEnabled = currentExtension ? currentExtension.enabled : true;

  // Renders the preview canvas depending on the active file
  const renderPreview = () => {
    if (!currentFile) {
      return (
        <div className="flex h-full items-center justify-center bg-[#09090b] text-muted-foreground text-sm font-mono p-6">
          <HelpCircle className="mr-2 h-5 w-5 text-accent" />
          Select a file to run preview simulation
        </div>
      );
    }

    if (!isExtensionEnabled) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-[#09090b] text-center p-8">
          <AlertCircle className="h-10 w-10 text-destructive mb-3 animate-pulse" />
          <h3 className="text-base font-semibold text-foreground">Visualization Extension Disabled</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm font-mono leading-relaxed">
            The &ldquo;{currentExtension?.name}&rdquo; extension has been disabled. Go to the Extensions tab in the left sidebar to enable it.
          </p>
        </div>
      );
    }

    switch (currentFile.path) {
      case "/chart.mermaid":
        return <MermaidChart content={currentFile.content} />;
      case "/d3-graph.js":
        return <D3Visualization content={currentFile.content} />;
      case "/three-scene.js":
        return <ThreeScene content={currentFile.content} />;
      case "/plotly-data.json":
        return <PlotlyChart content={currentFile.content} />;
      case "/network-vis.json":
        return <VisGraph content={currentFile.content} />;
      default:
        return (
          <div className="flex h-full items-center justify-center bg-[#09090b] text-muted-foreground text-xs font-mono">
            No live visualizer bound to this file type
          </div>
        );
    }
  };

  const getFileIcon = (iconName: string) => {
    switch (iconName) {
      case "git-fork":
        return <GitFork className="h-4 w-4 text-emerald-400" />;
      case "code":
        return <FileCode className="h-4 w-4 text-blue-400" />;
      case "box":
        return <Box className="h-4 w-4 text-purple-400" />;
      case "line-chart":
        return <LineChart className="h-4 w-4 text-cyan-400" />;
      case "network":
        return <Network className="h-4 w-4 text-amber-400" />;
      default:
        return <FileCode className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const triggerReset = () => {
    setConsoleLogs((prev) => [...prev, `[System] Triggered workspace state verification.`]);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#060608] text-foreground font-sans select-none">
      {/* Top Header Navigation */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-[#0c0c0e]/80 px-6 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-accent shadow-md">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">Nebula Core</h1>
            <p className="text-[10px] font-mono text-muted-foreground">Interactive Visual Playground</p>
          </div>
        </div>

        {/* Global Connection / Status Indicators */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs border border-border">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-accent font-mono">LIVE PREVIEW READY</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs border border-border">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] text-accent font-mono">ZUSTAND ACTIVE</span>
          </div>
        </div>

        {/* Layout Control Triggers */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-[#18181b] p-0.5 border border-border">
            <button
              onClick={() => setLayoutMode("split")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                layoutMode === "split"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setLayoutMode("editor")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                layoutMode === "editor"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Code Only
            </button>
            <button
              onClick={() => setLayoutMode("preview")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                layoutMode === "preview"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview Only
            </button>
          </div>

          <button
            onClick={triggerReset}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-[#18181b] text-muted-foreground hover:text-white transition-colors"
            title="Reload Workspace"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Sidebar Icon Tabs */}
        <div className="flex w-12 flex-col items-center border-r border-border bg-[#09090b] py-4 gap-4 z-20">
          <button
            onClick={() => setSidebarTab("explorer")}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              sidebarTab === "explorer" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-white"
            }`}
            title="Explorer"
          >
            <Folder className="h-5 w-5 transition-transform group-hover:scale-105" />
            {sidebarTab === "explorer" && <div className="absolute left-0 top-1/4 h-1/2 w-0.5 rounded bg-primary" />}
          </button>

          <button
            onClick={() => setSidebarTab("extensions")}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              sidebarTab === "extensions" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-white"
            }`}
            title="Extensions Manager"
          >
            <Puzzle className="h-5 w-5 transition-transform group-hover:scale-105" />
            {sidebarTab === "extensions" && <div className="absolute left-0 top-1/4 h-1/2 w-0.5 rounded bg-primary" />}
          </button>

          <button
            onClick={() => setSidebarTab("settings")}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              sidebarTab === "settings" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-white"
            }`}
            title="Settings"
          >
            <Settings className="h-5 w-5 transition-transform group-hover:scale-105" />
            {sidebarTab === "settings" && <div className="absolute left-0 top-1/4 h-1/2 w-0.5 rounded bg-primary" />}
          </button>
        </div>

        {/* Sidebar Tab Panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarTab}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full flex-col border-r border-border bg-[#0c0c0e]/95 backdrop-blur-md z-10"
          >
            {/* Panel Header */}
            <div className="flex h-11 items-center justify-between border-b border-border px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase select-none">
              <span>{sidebarTab}</span>
            </div>

            {/* Panel Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-3">
              {sidebarTab === "explorer" && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground font-semibold">
                    <span>WORKSPACE / ROOT</span>
                  </div>
                  {Object.values(files).map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setActiveFile(file.path)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-mono transition-colors ${
                        activeFile === file.path
                          ? "bg-secondary text-primary font-medium border border-border"
                          : "text-muted-foreground hover:bg-[#18181b] hover:text-white"
                      }`}
                    >
                      {getFileIcon(file.icon)}
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {sidebarTab === "extensions" && (
                <div className="flex flex-col gap-3">
                  {Object.values(extensions).map((ext) => (
                    <div
                      key={ext.id}
                      className="flex flex-col rounded-lg border border-border bg-[#18181b]/50 p-3 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary">
                            {getFileIcon(ext.icon)}
                          </div>
                          <div>
                            <h4 className="text-[11px] font-semibold text-foreground">{ext.name}</h4>
                            <p className="text-[9px] text-muted-foreground font-mono">v{ext.version}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] leading-normal text-muted-foreground">
                        {ext.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                        <span className="text-[9px] text-muted-foreground font-mono">by {ext.publisher}</span>
                        <button
                          onClick={() => {
                            toggleExtension(ext.id);
                            setConsoleLogs((prev) => [
                              ...prev,
                              `[Extension] ${ext.name} has been ${!ext.enabled ? "ENABLED" : "DISABLED"}.`
                            ]);
                          }}
                          className={`rounded px-2 py-0.5 text-[9px] font-mono font-medium transition-all ${
                            ext.enabled
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-[#27272a] text-muted-foreground hover:bg-[#3f3f46]"
                          }`}
                        >
                          {ext.enabled ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === "settings" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="rounded-lg border border-border bg-[#18181b]/30 p-3">
                    <h4 className="font-semibold text-foreground mb-2">IDE Preferences</h4>
                    <div className="flex flex-col gap-2.5 font-mono text-[10px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Font Family</span>
                        <span className="text-foreground">Geist Mono</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Font Size</span>
                        <span className="text-foreground">14px</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Minimap</span>
                        <span className="text-foreground text-emerald-400">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Theme</span>
                        <span className="text-foreground text-purple-400">VS-Dark Custom</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-[#18181b]/30 p-3">
                    <h4 className="font-semibold text-foreground mb-2">Keyboard Shortcuts</h4>
                    <div className="flex flex-col gap-1.5 font-mono text-[9px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Save (Compile)</span>
                        <kbd className="rounded bg-secondary px-1 border border-border">Ctrl + S</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Search file</span>
                        <kbd className="rounded bg-secondary px-1 border border-border">Ctrl + P</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Center/Right Layout Splits */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Main workspace editor + preview row */}
          <div className="flex flex-1 overflow-hidden">
            {/* 1. Code Editor Pane */}
            {(layoutMode === "split" || layoutMode === "editor") && (
              <div className="flex flex-1 flex-col border-r border-border bg-[#09090b]">
                {/* Editor Tabs Header */}
                <div className="flex h-11 items-center bg-[#0c0c0e] border-b border-border overflow-x-auto select-none scrollbar-none">
                  {openTabs.map((tabPath) => {
                    const tabFile = files[tabPath];
                    if (!tabFile) return null;
                    return (
                      <div
                        key={tabPath}
                        className={`flex h-full items-center gap-2 px-4 border-r border-border text-xs font-mono cursor-pointer transition-colors ${
                          activeFile === tabPath
                            ? "bg-[#09090b] text-primary border-t-2 border-t-primary"
                            : "text-muted-foreground hover:bg-[#18181b]/40 hover:text-white"
                        }`}
                        onClick={() => setActiveFile(tabPath)}
                      >
                        {getFileIcon(tabFile.icon)}
                        <span>{tabFile.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tabPath);
                          }}
                          className="rounded-full p-0.5 hover:bg-secondary text-muted-foreground/60 hover:text-white transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Monaco Editor Render */}
                <div className="flex-1 overflow-hidden relative">
                  <MonacoEditor />
                </div>
              </div>
            )}

            {/* 2. Visual Preview Canvas Pane */}
            {(layoutMode === "split" || layoutMode === "preview") && (
              <div className="flex flex-1 flex-col bg-[#09090b]">
                {/* Preview Pane Header */}
                <div className="flex h-11 items-center justify-between border-b border-border bg-[#0c0c0e] px-5 select-none">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-accent animate-pulse" />
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Interactive Preview Sandbox
                    </span>
                  </div>
                  {currentFile && (
                    <div className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-2.5 py-0.5 text-[9px] text-accent font-mono border border-border">
                      {currentFile.name.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Live Output Canvas */}
                <div className="flex-1 overflow-hidden relative">
                  {renderPreview()}
                </div>
              </div>
            )}
          </div>

          {/* Console / Output Logging Panel (Bottom collapse) */}
          <div className="h-40 border-t border-border bg-[#09090b] flex flex-col font-mono">
            <div className="flex h-8 items-center justify-between bg-[#0c0c0e] px-4 border-b border-border text-[10px] text-muted-foreground font-semibold tracking-wide uppercase select-none">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5" />
                <span>Compiler Terminal Logs</span>
              </div>
              <button
                onClick={() => setConsoleLogs([])}
                className="hover:text-white transition-colors text-[9px]"
              >
                Clear Log
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-[11px] text-zinc-400 space-y-1 select-text selection:bg-primary/30 scrollbar-thin">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2 leading-relaxed">
                  <span className="text-primary font-bold">~</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="flex gap-2 text-muted-foreground">
                <span className="text-accent animate-pulse font-bold">&gt;</span>
                <span className="animate-pulse">Listening for live updates...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
