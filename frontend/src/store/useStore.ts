import { create } from "zustand";

export interface VirtualFile {
  name: string;
  path: string;
  content: string;
  language: string;
  icon: string;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  publisher: string;
  version: string;
  icon: string;
  enabled: boolean;
}

interface IDEState {
  files: Record<string, VirtualFile>;
  activeFile: string;
  openTabs: string[];
  sidebarTab: "explorer" | "extensions" | "visualizations" | "settings";
  extensions: Record<string, Extension>;
  
  // Actions
  updateFileContent: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
  openFileInTab: (path: string) => void;
  closeTab: (path: string) => void;
  setSidebarTab: (tab: "explorer" | "extensions" | "visualizations" | "settings") => void;
  toggleExtension: (id: string) => void;
}

const INITIAL_FILES: Record<string, VirtualFile> = {
  "/chart.mermaid": {
    name: "chart.mermaid",
    path: "/chart.mermaid",
    language: "mermaid",
    icon: "git-fork",
    content: `graph TD
    A[Start: User Action] -->|Trigger| B(Zustand Store)
    B -->|State Update| C{Render View}
    C -->|Monaco Code| D[Editor Canvas]
    C -->|WebGL Scene| E[3D Three.js View]
    C -->|SVG Nodes| F[D3 Force Graph]
    
    style A fill:#a855f7,stroke:#3b82f6,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#1d4ed8,stroke-width:1px,color:#fff
    style D fill:#22c55e,stroke:#15803d,stroke-width:1px,color:#fff
    style E fill:#06b6d4,stroke:#0891b2,stroke-width:1px,color:#fff
    style F fill:#eab308,stroke:#ca8a04,stroke-width:1px,color:#fff
`,
  },
  "/d3-graph.js": {
    name: "d3-graph.js",
    path: "/d3-graph.js",
    language: "javascript",
    icon: "code",
    content: `// Edit D3 node parameters to update live graph!
const graphData = {
  nodes: [
    { id: "A", group: 1, size: 25 },
    { id: "B", group: 1, size: 15 },
    { id: "C", group: 2, size: 20 },
    { id: "D", group: 2, size: 10 },
    { id: "E", group: 3, size: 30 },
    { id: "F", group: 3, size: 18 }
  ],
  links: [
    { source: "A", target: "B", value: 3 },
    { source: "A", target: "C", value: 2 },
    { source: "B", target: "D", value: 1 },
    { source: "C", target: "E", value: 4 },
    { source: "E", target: "F", value: 5 },
    { source: "D", target: "F", value: 2 }
  ]
};
`,
  },
  "/three-scene.js": {
    name: "three-scene.js",
    path: "/three-scene.js",
    language: "javascript",
    icon: "box",
    content: `// Customize 3D Object settings
{
  "shape": "torusKnot", // cube, sphere, torus, torusKnot
  "color": "#8b5cf6",
  "wireframe": true,
  "rotationSpeedX": 0.01,
  "rotationSpeedY": 0.015,
  "scale": 1.2
}
`,
  },
  "/plotly-data.json": {
    name: "plotly-data.json",
    path: "/plotly-data.json",
    language: "json",
    icon: "line-chart",
    content: `{
  "title": "Real-time Algorithm Performance",
  "xData": [10, 50, 100, 500, 1000, 5000],
  "yData": {
    "Dijkstra": [0.1, 0.4, 0.9, 5.2, 12.1, 75.3],
    "Bellman-Ford": [0.2, 1.1, 4.5, 92.4, 380.1, 1920.4],
    "A* Search": [0.05, 0.2, 0.5, 2.1, 4.9, 22.8]
  }
}
`,
  },
  "/network-vis.json": {
    name: "network-vis.json",
    path: "/network-vis.json",
    language: "json",
    icon: "network",
    content: `{
  "nodes": [
    {"id": 1, "label": "Client Gate", "color": "#06b6d4"},
    {"id": 2, "label": "Zustand Core", "color": "#8b5cf6"},
    {"id": 3, "label": "Mermaid Compiler", "color": "#10b981"},
    {"id": 4, "label": "D3 Physics Engine", "color": "#f59e0b"},
    {"id": 5, "label": "WebGL Renderer", "color": "#ec4899"}
  ],
  "edges": [
    {"from": 1, "to": 2, "label": "dispatch"},
    {"from": 2, "to": 3, "label": "bind"},
    {"from": 2, "to": 4, "label": "forces"},
    {"from": 2, "to": 5, "label": "rasterize"}
  ]
}
`,
  }
};

const INITIAL_EXTENSIONS: Record<string, Extension> = {
  "mermaid-preview": {
    id: "mermaid-preview",
    name: "Mermaid Diagram Previewer",
    description: "Compiles and previews Mermaid flowchart files (*.mermaid) in real-time.",
    publisher: "Next.js Core Team",
    version: "1.0.4",
    icon: "git-fork",
    enabled: true
  },
  "d3-graph": {
    id: "d3-graph",
    name: "D3 Force-Directed Simulation",
    description: "Visualizes JavaScript arrays as node links with charge, gravity, and drag physics.",
    publisher: "DataViz Lab",
    version: "2.1.0",
    icon: "network",
    enabled: true
  },
  "three-webgl": {
    id: "three-webgl",
    name: "Three.js 3D WebGL Simulator",
    description: "Renders fully interactive 3D math geometries and mesh topologies in WebGL.",
    publisher: "ThreeJS Org",
    version: "0.160.0",
    icon: "box",
    enabled: true
  },
  "plotly-builder": {
    id: "plotly-builder",
    name: "Plotly Interactive Charts",
    description: "Plot mathematical coordinate models, vectors, and complexity limits with D3 fallbacks.",
    publisher: "Plotly Inc.",
    version: "4.8.2",
    icon: "line-chart",
    enabled: true
  },
  "vis-network": {
    id: "vis-network",
    name: "vis.js Network Physics",
    description: "High-performance node network editor with automated spacing and cluster configurations.",
    publisher: "Almende B.V.",
    version: "9.1.2",
    icon: "share-2",
    enabled: true
  }
};

export const useStore = create<IDEState>((set) => ({
  files: INITIAL_FILES,
  activeFile: "/chart.mermaid",
  openTabs: ["/chart.mermaid", "/d3-graph.js"],
  sidebarTab: "explorer",
  extensions: INITIAL_EXTENSIONS,

  updateFileContent: (path, content) =>
    set((state) => ({
      files: {
        ...state.files,
        [path]: {
          ...state.files[path],
          content,
        },
      },
    })),

  setActiveFile: (path) =>
    set((state) => {
      const openTabs = state.openTabs.includes(path)
        ? state.openTabs
        : [...state.openTabs, path];
      return { activeFile: path, openTabs };
    }),

  openFileInTab: (path) =>
    set((state) => ({
      openTabs: state.openTabs.includes(path)
        ? state.openTabs
        : [...state.openTabs, path],
      activeFile: path,
    })),

  closeTab: (path) =>
    set((state) => {
      const openTabs = state.openTabs.filter((t) => t !== path);
      let activeFile = state.activeFile;
      if (activeFile === path && openTabs.length > 0) {
        activeFile = openTabs[openTabs.length - 1];
      } else if (openTabs.length === 0) {
        activeFile = "";
      }
      return { openTabs, activeFile };
    }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  toggleExtension: (id) =>
    set((state) => ({
      extensions: {
        ...state.extensions,
        [id]: {
          ...state.extensions[id],
          enabled: !state.extensions[id].enabled,
        },
      },
    })),
}));
