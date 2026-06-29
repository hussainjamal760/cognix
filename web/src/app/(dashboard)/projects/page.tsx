"use client";

import { useEffect, useState } from "react";
import { Plus, Folder, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  repositories: Array<{ id: string; name: string }>;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setShowModal(false);
        fetchProjects();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to create project");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 to-zinc-300">
              Cognix
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
            Your Projects
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your codebases and monitor structural vector ingestion pipelines.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-sm text-zinc-500">Loading workspaces...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/10 backdrop-blur-sm max-w-lg mx-auto mt-8">
            <Folder className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-200">No projects found</h3>
            <p className="text-zinc-500 text-sm mt-1.5 px-4">
              Get started by creating a project workspace to connect your GitHub repositories.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between p-6 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 rounded-xl hover:shadow-lg transition duration-200 backdrop-blur-sm"
              >
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 group-hover:text-indigo-400 transition">
                    {project.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <div className="mt-8 border-t border-zinc-850 pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-zinc-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition duration-150" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-50 mb-1">Create Project Workspace</h2>
            <p className="text-zinc-500 text-xs mb-6">
              Organize repositories and memory integrations in a clean workspace environment.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payments Gateway"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="e.g. Handles stripe webhooks, payouts, and customer subscriptions."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-500 bg-rose-950/20 border border-rose-900/50 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 mt-6 pt-2 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !name}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition active:scale-[0.98] disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
