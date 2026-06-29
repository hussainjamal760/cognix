"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Loader2,
  Send,
  Sparkles,
  GitBranch,
  Network,
  Info,
  ChevronRight,
  RefreshCw,
  CornerDownRight,
  Database
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


interface Repository {
  id: string;
  name: string;
  owner: string;
  branch: string;
}

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Array<{ text: string; score: number }>;
}

interface Node {
  id: string;
  label: string;
  properties?: Record<string, any>;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const params = useParams() as { projectId: string } | null;
  const projectId = params?.projectId || "";

  const [project, setProject] = useState<any>(null);
  const [repo, setRepo] = useState<Repository | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // Ingestion form state
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [ingesting, setIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<"PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null>(null);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestError, setIngestError] = useState("");

  // Chat state
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Graph state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Fetch project details & active ingestion jobs
  const loadProjectData = async () => {
    if (!projectId) return;
    try {
      setLoadingProject(true);
      const res = await fetch(`/api/projects`);
      if (res.ok) {
        const data = await res.json();
        const activeProj = data.find((p: any) => p.id === projectId);
        if (activeProj) {
          setProject(activeProj);
          if (activeProj.repositories && activeProj.repositories.length > 0) {
            const linkedRepo = activeProj.repositories[0];
            setRepo(linkedRepo);
            
            // Check ingestion status
            await checkSyncStatus(projectId, linkedRepo.id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProject(false);
    }
  };

  const checkSyncStatus = async (pId: string, rId: string) => {
    try {
      const res = await fetch(`/api/projects/${pId}/ingestion/status?repoId=${rId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setIngestStatus(data.status);
          setIngestProgress(data.progress || 0);
          if (data.status === "COMPLETED") {
            loadGraphData();
          } else if (data.status === "PROCESSING" || data.status === "PENDING") {
            setIngesting(true);
          } else if (data.status === "FAILED") {
            setIngestError(data.errorMessage || "Indexing pipeline failed.");
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadGraphData = async () => {
    if (!projectId) return;
    setGraphLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/graph`);
      if (res.ok) {
        const data = await res.json();
        // Distribute nodes randomly on canvas for basic simulation
        const processedNodes = (data.nodes || []).map((node: any, idx: number) => {
          const angle = (idx / (data.nodes.length || 1)) * 2 * Math.PI;
          const radius = 100 + Math.random() * 80;
          return {
            ...node,
            x: 250 + radius * Math.cos(angle),
            y: 250 + radius * Math.sin(angle),
          };
        });
        setNodes(processedNodes);
        setEdges(data.edges || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGraphLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Sync status polling effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (ingesting && (ingestStatus === "PENDING" || ingestStatus === "PROCESSING")) {
      timer = setInterval(() => {
        if (repo) {
          checkSyncStatus(projectId, repo.id);
        } else {
          loadProjectData();
        }
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [ingesting, ingestStatus, repo]);

  // 2. Trigger Repository Import & Ingestion
  const handleImportRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner || !repoName) return;
    setIngesting(true);
    setIngestError("");
    setIngestStatus("PENDING");
    setIngestProgress(10);

    try {
      const res = await fetch(`/api/projects/${projectId}/repositories/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, name: repoName, branch }),
      });

      if (res.ok) {
        const data = await res.json();
        setIngestStatus("PROCESSING");
        setIngestProgress(20);
        // Refresh project list to retrieve the newly created repo ID
        await loadProjectData();
      } else {
        const errData = await res.json();
        setIngestError(errData.error || "Failed to trigger sync");
        setIngestStatus("FAILED");
        setIngesting(false);
      }
    } catch (err: any) {
      setIngestError(err.message || "Connection failed");
      setIngestStatus("FAILED");
      setIngesting(false);
    }
  };

  // 3. Send AI Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const userText = inputMessage;
    setInputMessage("");
    setSendingMessage(true);

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: "USER",
      content: userText,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText, chatSessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatSessionId(data.chatSessionId);
        
        const assistMsg: Message = {
          id: data.assistantMessage.id,
          role: "ASSISTANT",
          content: data.assistantMessage.content,
          citations: data.assistantMessage.citations || [],
        };
        setMessages((prev) => [...prev, assistMsg]);

        // Highlight cited files in the graph visualization
        if (assistMsg.citations && assistMsg.citations.length > 0) {
          const highlightedSet = new Set<string>();
          assistMsg.citations.forEach((cit) => {
            // Find nodes containing matching citations keywords
            nodes.forEach((n) => {
              if (cit.text.toLowerCase().includes(n.label.toLowerCase())) {
                highlightedSet.add(n.id);
              }
            });
          });
          setHighlightedNodeIds(highlightedSet);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  // 4. Render 2D Canvas Graph Representation
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Edges
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (sourceNode?.x && sourceNode?.y && targetNode?.x && targetNode?.y) {
          ctx.strokeStyle = "rgba(63, 63, 70, 0.4)";
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();

          // Render edge label in middle of connection line
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          ctx.font = "8px monospace";
          ctx.fillStyle = "rgba(113, 113, 122, 0.6)";
          ctx.textAlign = "center";
          ctx.fillText(edge.label, midX, midY - 3);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        if (!node.x || !node.y) return;

        const isHighlighted = highlightedNodeIds.has(node.id);
        const isSelected = selectedNode?.id === node.id;

        // Outer glow
        if (isHighlighted) {
          ctx.shadowColor = "rgba(79, 70, 229, 0.6)";
          ctx.shadowBlur = 12;
        } else if (isSelected) {
          ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
        }

        // Circle node base
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 10 : 7, 0, 2 * Math.PI);
        if (isHighlighted) {
          ctx.fillStyle = "#6366f1";
        } else if (isSelected) {
          ctx.fillStyle = "#a855f7";
        } else {
          const type = node.properties?.type;
          ctx.fillStyle = type === "project" ? "#e4e4e7" : 
                          type === "file" ? "#312e81" : 
                          type === "database-model" ? "#581c87" : "#18181b";
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Border ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isSelected ? "#c084fc" : isHighlighted ? "#818cf8" : "#3f3f46";
        ctx.stroke();

        // Node Title Labels
        ctx.font = isSelected ? "bold 11px sans-serif" : "9px sans-serif";
        ctx.fillStyle = isSelected ? "#fafafa" : "#a1a1aa";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y - 12);
      });
    };

    draw();

    // Canvas click handling setup
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let clickedNode: Node | null = null;
      for (const node of nodes) {
        if (node.x && node.y) {
          const distance = Math.sqrt((clickX - node.x) ** 2 + (clickY - node.y) ** 2);
          if (distance <= 12) {
            clickedNode = node;
            break;
          }
        }
      }
      setSelectedNode(clickedNode);
    };

    canvas.addEventListener("click", handleCanvasClick);
    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [nodes, edges, selectedNode, highlightedNodeIds]);

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center space-y-3 flex-col text-zinc-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm">Loading Project environment...</span>
      </div>
    );
  }

  const isCompletedSync = repo && ingestStatus === "COMPLETED";

  return (
    <div className="h-screen bg-[#09090b] text-zinc-100 flex flex-col overflow-hidden font-sans">
      {/* Mini Workspace Header */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/projects" className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition">
            Projects
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
          <span className="text-sm font-bold text-zinc-100">{project?.name}</span>
          {repo && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
              <GitBranch className="w-3 h-3 text-indigo-400" />
              <span>{repo.owner}/{repo.name} ({repo.branch})</span>
            </div>
          )}
        </div>
        {isCompletedSync && (
          <button
            onClick={loadGraphData}
            className="p-1.5 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
            title="Reload Cognee Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${graphLoading ? "animate-spin" : ""}`} />
          </button>
        )}
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* State A: Show Ingestion Onboarding Screen */}
        {!isCompletedSync ? (
          <div className="flex-1 flex items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />

            <div className="w-full max-w-lg bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md shadow-xl flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <GithubIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-50 mb-2">Connect Repository Source</h2>
              <p className="text-zinc-400 text-sm text-center mb-8 max-w-sm">
                Import codebases to let Cognee build an AI-powered graph vector memory representation.
              </p>

              {ingesting ? (
                /* Ingestion Progress UI */
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      <span>{ingestStatus === "PROCESSING" ? "Indexing Codebase..." : "Queue Initiated"}</span>
                    </span>
                    <span>{ingestProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${ingestProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                    Cognee is parsing the repository, running abstract syntax tree (AST) extraction, and writing structural relationships to the graph memory. This may take up to 2 minutes.
                  </p>
                </div>
              ) : (
                /* Ingestion Form */
                <form onSubmit={handleImportRepo} className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Repo Owner</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. facebook"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Repository Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. react"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Branch</label>
                    <input
                      type="text"
                      required
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  {ingestError && (
                    <div className="text-xs text-rose-500 bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg leading-relaxed">
                      {ingestError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>Start Cognee Ingestion</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* State B: Ingestion complete - Show split Chat + Interactive Graph screen */
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: AI Chat Panel */}
            <div className="w-1/2 border-r border-zinc-800/80 bg-zinc-950/20 flex flex-col overflow-hidden">
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <Sparkles className="w-10 h-10 text-indigo-400/80 mb-4 animate-pulse" />
                    <h3 className="text-base font-bold text-zinc-200">Start a codebase consultation</h3>
                    <p className="text-zinc-500 text-xs mt-1.5 max-w-xs leading-relaxed">
                      Ask questions about authentication pathways, dependencies, database entities, or specific files.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-2 max-w-[85%] ${
                        msg.role === "USER" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                          msg.role === "USER"
                            ? "bg-indigo-600/90 text-white border-indigo-500/40 rounded-br-none"
                            : "bg-zinc-900/60 text-zinc-100 border-zinc-800 rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Display evidence citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-col space-y-1.5 px-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center space-x-1">
                            <Database className="w-3 h-3 text-indigo-400" />
                            <span>Memory Graph Evidence</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((c, i) => (
                              <div
                                key={i}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-950/30 border border-indigo-900/50 text-[10px] text-indigo-300 font-mono"
                              >
                                <CornerDownRight className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[150px]" title={c.text}>{c.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Chat input console */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Ask a question about the project..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={sendingMessage}
                    className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || sendingMessage}
                    className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition active:scale-95 disabled:opacity-50"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Interactive Knowledge Graph Canvas */}
            <div className="w-1/2 h-full bg-[#070708] flex flex-col relative">
              {graphLoading ? (
                <div className="absolute inset-0 flex items-center justify-center space-y-2 flex-col bg-[#070708]/80 z-20">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-xs text-zinc-500">Traversing Graph database...</span>
                </div>
              ) : nodes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                  No nodes loaded in memory.
                </div>
              ) : null}

              {/* Canvas viewport */}
              <canvas
                ref={canvasRef}
                width={550}
                height={500}
                className="w-full h-full cursor-crosshair"
              />

              {/* Float Graph Details Sidebar */}
              {selectedNode && (
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-md shadow-xl max-h-[160px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                      {selectedNode.properties?.type || "Node Entity"}
                    </span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-50">{selectedNode.label}</h4>
                  
                  {selectedNode.properties && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(selectedNode.properties).map(([k, v]) => {
                        if (k === "type" || k === "label") return null;
                        return (
                          <div key={k} className="flex text-[10px] font-mono">
                            <span className="text-zinc-500 w-24 shrink-0">{k}:</span>
                            <span className="text-zinc-300 truncate">{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Map legend */}
              <div className="absolute top-4 left-4 p-3 bg-zinc-900/50 border border-zinc-800/40 rounded-lg text-[10px] font-medium text-zinc-400 space-y-1.5 backdrop-blur-sm pointer-events-none">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
                  <span>Project Node</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-indigo-400 inline-block" />
                  <span>Files / Classes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-950 border border-purple-400 inline-block" />
                  <span>Methods / DB Models</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
