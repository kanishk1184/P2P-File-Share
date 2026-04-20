"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectionState } from "@/components/hooks/useWebRTC";

interface RoomHeaderProps {
  roomId: string;
  status: ConnectionState;
}

export function RoomHeader({ roomId, status }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {
      const el = document.createElement("textarea");
      el.value = roomId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const statusConfig = {
    connecting: {
      label: "Connecting",
      dot: "#fbbf24",
      border: "rgba(251,191,36,0.18)",
      bg: "rgba(251,191,36,0.06)",
      color: "#fbbf24",
      pulse: true,
    },
    waiting: {
      label: "Awaiting Peer",
      dot: "#60a5fa",
      border: "rgba(96,165,250,0.18)",
      bg: "rgba(96,165,250,0.06)",
      color: "#60a5fa",
      pulse: true,
    },
    connected: {
      label: "Connected",
      dot: "#22d3ee",
      border: "rgba(34,211,238,0.18)",
      bg: "rgba(34,211,238,0.06)",
      color: "#22d3ee",
      pulse: false,
    },
    error: {
      label: "Error",
      dot: "#f87171",
      border: "rgba(248,113,113,0.18)",
      bg: "rgba(248,113,113,0.06)",
      color: "#f87171",
      pulse: false,
    },
  };

  const cfg = statusConfig[status] ?? statusConfig.connecting;

  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-3.5 border-b"
      style={{ background: "#0a0a0c", borderColor: "#141416" }}
    >
      {/* Left: Logo + Room code copy */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-[10px] text-zinc-700 tracking-[0.18em] shrink-0 hidden sm:block">ROOM //</span>

        <motion.button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm tracking-[0.18em] transition-colors min-w-0 hover:cursor-pointer"
          style={{
            background: copied ? "rgba(34,211,238,0.07)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${copied ? "rgba(34,211,238,0.22)" : "#1e1e22"}`,
            color: copied ? "#22d3ee" : "#71717a",
          }}
          whileHover={{ scale: 1.02, borderColor: "rgba(34,211,238,0.22)", color: "#22d3ee" }}
          whileTap={{ scale: 0.97 }}
          title="Click to copy room code"
        >
          <span className="truncate text-zinc-200 tracking-[0.22em]" style={{ color: copied ? "#22d3ee" : "#a1a1aa" }}>
            {roomId}
          </span>

          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.svg
                key="check"
                initial={{ opacity: 0, rotate: -10, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className="font-mono text-[10px] tracking-widest text-cyan-500 hidden sm:block"
            >
              COPIED
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Status badge */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5 shrink-0"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background: cfg.dot,
            boxShadow: `0 0 6px ${cfg.dot}`,
            animation: cfg.pulse ? "statusPulse 1.8s ease-in-out infinite" : "none",
          }}
        />
        <span
          className="font-mono text-[11px] tracking-wide"
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}