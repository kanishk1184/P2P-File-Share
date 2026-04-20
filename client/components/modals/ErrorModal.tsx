"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ErrorModalProps {
  message: string;
}

export function ErrorModal({ message }: ErrorModalProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#080809] flex items-center justify-center px-4 overflow-hidden font-mono">

      {/* Red glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-125 h-75 opacity-10"
        style={{ background: "radial-gradient(ellipse at top, #f87171, transparent 70%)", filter: "blur(50px)" }} />

      <span className="fixed top-5 left-5 text-[10px] text-zinc-800 tracking-[0.2em]">FILEDROP//ERR</span>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#0d0d0f", border: "1px solid rgba(248,113,113,0.18)", boxShadow: "0 0 60px rgba(248,113,113,0.06)" }}
      >
        {/* Header strip */}
        <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: "#141416", background: "#0a0a0c" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ boxShadow: "0 0 6px #f87171" }} />
          <span className="text-[10px] tracking-[0.2em] text-zinc-700">CONNECTION_ERROR</span>
        </div>

        <div className="p-6 text-center">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold tracking-tight text-zinc-100 mb-2" style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
            Connection Failed
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed mb-6 px-2">{message}</p>

          <motion.button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm py-3 tracking-wide transition-colors hover:cursor-pointer"
            style={{ background: "#141416", border: "1px solid #1e1e22", color: "#71717a" }}
            whileHover={{ borderColor: "#27272a", color: "#a1a1aa", backgroundColor: "#161618" }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}