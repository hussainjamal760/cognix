import Link from "next/link";
import { ArrowRight, Cpu, Network, Sparkles, Database, Code, GitFork } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Decorative Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Floating Radial Ambient Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 to-zinc-300">
              Cognix
            </span>
          </div>

          <Link
            href="/projects"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-200 transition"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
        {/* Banner Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Cognee Graph Memory</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-400">
          Understand any codebase through AI-powered memory
        </h1>

        {/* Hero Tagline */}
        <p className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed mb-10 px-4">
          Cognix builds structured, persistent knowledge graphs from your repositories, allowing you to ask complex architectural questions grounded in real relationship metadata.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Link
            href="/projects"
            className="flex items-center space-x-2 px-6 py-3.5 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl transition duration-150 shadow-md hover:shadow-lg shadow-white/5 group active:scale-[0.98]"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition duration-150" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-850 pt-16 text-left">
          {/* Card 1 */}
          <div className="p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-xl hover:border-zinc-700/60 transition duration-200 backdrop-blur-sm">
            <div className="w-10 h-10 mb-4 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
              <Network className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Knowledge Graph Traversal</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Maps code modules, dependencies, commits, and discussion boards into semantic relationships. Query variables or classes and see visual dependency structures.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-xl hover:border-zinc-700/60 transition duration-200 backdrop-blur-sm">
            <div className="w-10 h-10 mb-4 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Hybrid Vector Memory</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Combines traditional vector embeddings with graph traversal pipelines. Cognee ensures your context remains highly relevant, precise, and contextually grounded.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-xl hover:border-zinc-700/60 transition duration-200 backdrop-blur-sm">
            <div className="w-10 h-10 mb-4 bg-zinc-100/10 rounded-lg flex items-center justify-center border border-zinc-700/20">
              <Code className="w-5 h-5 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Explainable Citations</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Answers from the chatbot include visual citations pointing to files and lines of code. Simply click a reference card to highlight that node directly in the graph canvas.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-zinc-950/20 py-8 relative z-10 text-center text-xs text-zinc-500">
        <span>© 2026 Cognix. Understanding engineering architectures.</span>
      </footer>
    </div>
  );
}
