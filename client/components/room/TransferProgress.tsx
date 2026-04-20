"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TransferProgressProps {
  isActive: boolean;
  progress: number;
  type: "upload" | "download";
  fileName?: string;
}

export function TransferProgress({ isActive, progress, type, fileName }: TransferProgressProps) {
  const clamp = Math.min(progress, 100);
  const isUpload = type === "upload";

  const color = isUpload ? "#60a5fa" : "#22d3ee";
  const label = isUpload ? "SENDING" : "RECEIVING";
  const arrow = isUpload ? "↑" : "↓";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key={type}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-t"
          style={{ borderColor: "#141416" }}
        >
          <div className="px-5 py-3.5" style={{ background: "#0a0a0c" }}>
            {/* Row: badge + filename + percent */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Direction badge */}
                <span
                  className="font-mono text-[10px] tracking-[0.15em] shrink-0 rounded px-1.5 py-0.5"
                  style={{
                    color,
                    background: `rgba(${isUpload ? "96,165,250" : "34,211,238"},0.07)`,
                    border: `1px solid rgba(${isUpload ? "96,165,250" : "34,211,238"},0.18)`,
                  }}
                >
                  {arrow} {label}
                </span>

                {/* Filename */}
                <span className="font-mono text-xs text-zinc-500 truncate">
                  {fileName || (isUpload ? "Sending file..." : "Receiving file...")}
                </span>
              </div>

              {/* Percentage */}
              <span className="font-mono text-sm font-medium shrink-0" style={{ color }}>
                {clamp}%
              </span>
            </div>

            {/* Track */}
            <div className="relative h-0.75 rounded-full overflow-hidden" style={{ background: "#1a1a1e" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}55` }}
                initial={{ width: "0%" }}
                animate={{ width: `${clamp}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-y-0 w-16 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}44, transparent)`,
                  left: `${Math.max(clamp - 10, 0)}%`,
                }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}