"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Cpu, Sparkles } from "lucide-react";

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


export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/projects" });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#09090b] overflow-hidden text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Decorative Grid and Ambient Glow Backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md p-8 mx-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Brand Logo & Icon */}
        <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Cpu className="w-8 h-8 text-zinc-50" />
        </div>

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 tracking-tight text-center mb-2">
          Cognix
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-8 px-4 leading-relaxed">
          Understand any codebase through AI-powered graph memory.
        </p>

        {/* Interactive Features Teaser */}
        <div className="w-full space-y-3.5 mb-8">
          <div className="flex items-center space-x-3 text-xs bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/30">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
            <span className="text-zinc-300">Hybrid graph-vector retrieval memory</span>
          </div>
          <div className="flex items-center space-x-3 text-xs bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/30">
            <Cpu className="w-4.5 h-4.5 text-purple-400 shrink-0" />
            <span className="text-zinc-300">Entity relationship explanation (Cognee)</span>
          </div>
        </div>

        {/* GitHub Sign In Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 px-5 py-3.5 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 hover:text-zinc-900 font-medium rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <GithubIcon className="w-5 h-5 text-zinc-950 group-hover:scale-110 transition duration-200" />
              <span>Connect with GitHub</span>
            </>
          )}
        </button>

        {/* Footer details */}
        <span className="text-[10px] text-zinc-600 mt-6 tracking-wide uppercase font-semibold">
          Secure GitHub OAuth Authentication
        </span>
      </div>
    </div>
  );
}
