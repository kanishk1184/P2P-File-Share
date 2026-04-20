"use client";

import { motion } from "framer-motion";

interface IncomingRequest {
  name: string;
  size: number;
  type: string;
}

interface IncomingFileDialogProps {
  request: IncomingRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingFileDialog({ request, onAccept, onDecline }: IncomingFileDialogProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getExt = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase().slice(0, 4) : "FILE";
  };

  return (
    <motion.div
      key="dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(8,8,9,0.82)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#0d0d0f", border: "1px solid #1e1e22", boxShadow: "0 0 0 1px rgba(255,255,255,0.02), 0 32px 64px rgba(0,0,0,0.6)" }}
      >
        {/* Header strip */}
        <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "#141416", background: "#0a0a0c" }}>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#22d3ee", boxShadow: "0 0 6px #22d3ee" }}
          />
          <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">INCOMING TRANSFER</span>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* File card */}
          <div
            className="flex items-center gap-4 rounded-xl p-4 mb-5"
            style={{ background: "#080809", border: "1px solid #1a1a1e" }}
          >
            {/* Ext badge */}
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.14)" }}
            >
              <span className="font-mono text-[10px] font-bold tracking-wider text-cyan-500">
                {getExt(request.name)}
              </span>
            </div>

            <div className="min-w-0">
              <p className="font-mono text-sm text-zinc-200 truncate mb-0.5" title={request.name}>
                {request.name}
              </p>
              <p className="font-mono text-xs text-zinc-600">{formatBytes(request.size)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <motion.button
              onClick={onDecline}
              className="flex-1 rounded-xl font-mono text-sm py-3 tracking-wide transition-colors hover:cursor-pointer"
              style={{
                background: "transparent",
                border: "1px solid #1e1e22",
                color: "#52525b",
              }}
              whileHover={{ borderColor: "rgba(248,113,113,0.3)", color: "#f87171", backgroundColor: "rgba(248,113,113,0.04)" }}
              whileTap={{ scale: 0.97 }}
            >
              Decline
            </motion.button>

            <motion.button
              onClick={onAccept}
              className="flex-2 flex items-center justify-center gap-2 rounded-xl font-mono text-sm py-3 tracking-wide hover:cursor-pointer"
              style={{
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.22)",
                color: "#22d3ee",
              }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(34,211,238,0.15)" }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Accept
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}