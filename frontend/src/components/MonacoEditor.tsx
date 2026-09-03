"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";

export default function MonacoEditor() {
  const { files, activeFile, updateFileContent } = useStore();

  const currentFile = files[activeFile];

  if (!currentFile) {
    return (
      <div className="flex h-full items-center justify-center bg-[#09090b] text-muted-foreground text-sm font-mono">
        Open a file from the explorer sidebar to begin coding
      </div>
    );
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(activeFile, value);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#09090b]">
      {/* Editor Header Path Info */}
      <div className="flex h-9 items-center justify-between border-b border-border bg-[#0c0c0e] px-4 text-xs font-mono text-muted-foreground select-none">
        <div className="flex items-center gap-2">
          <span className="text-primary-foreground/40">workspace</span>
          <span>/</span>
          <span className="text-accent font-medium">{currentFile.path.slice(1)}</span>
        </div>
        <div className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] text-accent border border-border">
          {currentFile.language.toUpperCase()}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={currentFile.language}
          value={currentFile.content}
          onChange={handleEditorChange}
          theme="vs-dark"
          loading={
            <div className="absolute inset-0 flex items-center justify-center bg-[#09090b] text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-xs font-mono">Loading IDE editor engine...</span>
            </div>
          }
          options={{
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), Courier New, monospace",
            minimap: { enabled: true },
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 12 },
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
