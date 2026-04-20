"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectionState } from "@/components/hooks/useWebRTC";

interface FileDropZoneProps {
  status: ConnectionState;
  roomId: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropZone({ status, roomId, onFileSelect, disabled = false }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (status !== "connected" || disabled) {
      setIsDragging(false);
      return;
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (dragCounter.current === 1) setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) setIsDragging(false);
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [status, disabled, onFileSelect]);

  const handleInputSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) onFileSelect(e.target.files[0]);
    e.target.value = "";
  };

  /* ── Waiting / Connecting state ── */
  if (status !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center min-h-55 gap-5">
        <div className="relative">
          {/* Orbiting ring */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.12)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" strokeLinecap="round">
              {status === "connecting" ? (
                <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              ) : (
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              )}
            </svg>
          </div>

          {/* Spinning ring around icon */}
          <svg
            className="absolute inset-0 w-14 h-14"
            style={{ animation: "spin 3s linear infinite" }}
            viewBox="0 0 56 56"
          >
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1" strokeDasharray="6 10" />
          </svg>
        </div>

        <div className="text-center">
          {status === "connecting" ? (
            <>
              <p className="font-mono text-sm text-zinc-400 mb-1">Establishing secure channel...</p>
              <p className="font-mono text-xs text-zinc-700">Connecting to signalling server</p>
            </>
          ) : (
            <>
              <p className="font-mono text-sm text-zinc-400 mb-2">
                Share{" "}
                <span
                  className="font-mono text-sm tracking-widest rounded px-2 py-0.5"
                  style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee" }}
                >
                  {roomId}
                </span>
                {" "}with your peer
              </p>
              <p className="font-mono text-xs text-zinc-700">Waiting for peer to join</p>
            </>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Connected: Drop zone ── */
  return (
    <>
      <label
        htmlFor="file-upload"
        className={`relative block flex rounded-xl text-center transition-all duration-200 min-h-47.5 flex-col items-center justify-center gap-4 cursor-pointer ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        style={{
          background: isDragging
            ? "rgba(34,211,238,0.04)"
            : "rgba(255,255,255,0.01)",
          border: isDragging
            ? "1.5px dashed rgba(34,211,238,0.5)"
            : disabled
            ? "1.5px dashed #1a1a1e"
            : "1.5px dashed #27272a",
          boxShadow: isDragging
            ? "0 0 0 4px rgba(34,211,238,0.05), inset 0 0 40px rgba(34,211,238,0.03)"
            : "none",
          transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Corner brackets — only show when not dragging */}
        {!isDragging && !disabled && (
          <>
            <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-zinc-800 rounded-tl" />
            <span className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-zinc-800 rounded-tr" />
            <span className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-zinc-800 rounded-bl" />
            <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-zinc-800 rounded-br" />
          </>
        )}

        {/* Icon */}
        <motion.div
          animate={isDragging ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: isDragging ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
            border: isDragging ? "1px solid rgba(34,211,238,0.25)" : "1px solid #1e1e22",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={isDragging ? "#22d3ee" : disabled ? "#3f3f46" : "#52525b"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {disabled ? (
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" />
            ) : (
              <>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </>
            )}
          </svg>
        </motion.div>

        {/* Text */}
        <div>
          <p className="font-mono text-sm text-zinc-400 mb-1">
            {disabled ? "Transfer in progress..." : isDragging ? "Release to send" : "Drop file or click to browse"}
          </p>
          <p className="font-mono text-xs text-zinc-700">
            {disabled ? "Wait for current transfer to finish" : "Any file · Any size · Sent directly"}
          </p>
        </div>

        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleInputSelect}
          disabled={disabled}
        />
      </label>

      {/* Full-screen drag overlay */}
      <AnimatePresence>
        {isDragging && !disabled && (
          <motion.div
            key="drag-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            style={{ background: "rgba(8,8,9,0.88)", backdropFilter: "blur(6px)" }}
          >
            {/* Glowing border */}
            <div
              className="absolute inset-4 rounded-2xl"
              style={{
                border: "1.5px dashed rgba(34,211,238,0.35)",
                boxShadow: "inset 0 0 60px rgba(34,211,238,0.04)",
              }}
            />

            <motion.div
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center gap-3 rounded-2xl px-8 py-4 font-mono text-base font-medium tracking-wide"
              style={{
                background: "#0d0d0f",
                border: "1px solid rgba(34,211,238,0.25)",
                color: "#22d3ee",
                boxShadow: "0 0 40px rgba(34,211,238,0.12)",
              }}
            >
              <motion.svg
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </motion.svg>
              Drop to send
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}