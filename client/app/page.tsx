"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customAlphabet } from "nanoid";
import { motion, AnimatePresence, Variants } from "framer-motion";

const alphabets = "0123456789abcdefghijklmnopqrstuvwxyz";
const generateString = customAlphabet(alphabets, 10);
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const [roomId, setRoomId] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "ok" | "error">("checking");
  const router = useRouter();

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const data = await fetch(`${backendUrl}/`);
      const msg = await data.text();
      console.log(msg);
      setBackendStatus("ok");
    } catch (error) {
      console.log("Error waking signalling server up", error);
      setBackendStatus("error");
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = generateString();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.length === 10) {
      router.push(`/room/${roomId}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setRoomId(cleanValue.toLowerCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && roomId.length === 10) handleJoinRoom();
  };

  const stagger: {
    container: Variants,
    item: Variants
  } = {
    container: {
      hidden: {},
      show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, y: 18 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    },
  };

  const statusColor = backendStatus === "ok" ? "#22d3ee" : backendStatus === "error" ? "#f87171" : "#52525b";
  const statusLabel = backendStatus === "checking" ? "CONNECTING" : backendStatus === "ok" ? "ONLINE" : "OFFLINE";

  return (
    <div className="relative min-h-screen bg-[#080809] flex flex-col items-center justify-center px-4 py-16 overflow-hidden font-mono">

      {/* Subtle noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      {/* Top glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-65 opacity-[0.12]"
        style={{ background: "radial-gradient(ellipse at top, #22d3ee, transparent 70%)", filter: "blur(40px)" }} />

      {/* Corner labels */}
      <span className="fixed top-5 left-5 text-[10px] text-zinc-800 tracking-[0.2em] z-10 select-none">FILEDROP//v1</span>
      <div className="fixed top-5 right-5 flex items-center gap-2 z-10">
        <span
          className="w-1.5 h-1.5 rounded-full transition-colors duration-700"
          style={{ background: statusColor, boxShadow: backendStatus === "ok" ? `0 0 8px ${statusColor}` : "none" }}
        />
        <span className="text-[10px] text-zinc-700 tracking-[0.18em]">{statusLabel}</span>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm"
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        {/* Logo + tagline */}
        <motion.div variants={stagger.item} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.18)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
                <line x1="12" y1="12" x2="12" y2="18" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-100 leading-none mb-0.5"
                style={{ fontFamily: "'Geist', 'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                FileDrop
              </h1>
              <p className="text-[10px] text-zinc-700 tracking-[0.15em]">PEER-TO-PEER FILE TRANSFER</p>
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={stagger.item}
          className="rounded-2xl overflow-hidden"
          style={{ background: "#0d0d0f", border: "1px solid #1a1a1e" }}
        >
          {/* Create */}
          <div className="p-5 border-b border-[#141416]">
            <p className="text-[10px] text-zinc-700 tracking-[0.18em] uppercase mb-3">// New Session</p>
            <motion.button
              onClick={handleCreateRoom}
              className="w-full flex items-center justify-center gap-2 rounded-xl text-sm py-3.5 tracking-wide transition-colors hover:cursor-pointer"
              style={{
                background: "rgba(34,211,238,0.07)",
                border: "1px solid rgba(34,211,238,0.18)",
                color: "#22d3ee",
              }}
              whileHover={{ scale: 1.015, backgroundColor: "rgba(34,211,238,0.12)" }}
              whileTap={{ scale: 0.975 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Room
            </motion.button>
          </div>

          {/* Join */}
          <div className="p-5">
            <p className="text-[10px] text-zinc-700 tracking-[0.18em] uppercase mb-3">// Join Existing</p>
            <div className="relative mb-3">
              <input
                type="text"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                maxLength={10}
                placeholder="enter room code"
                value={roomId}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl text-lg tracking-[0.28em] text-center py-3.5 px-4 outline-none transition-all bg-[#080809] placeholder:text-zinc-800 placeholder:tracking-widest placeholder:text-sm text-zinc-100"
                style={{
                  border: `1px solid ${roomId.length > 0 ? "rgba(34,211,238,0.28)" : "#1a1a1e"}`,
                  caretColor: "#22d3ee",
                  boxShadow: roomId.length === 10 ? "0 0 0 3px rgba(34,211,238,0.06), 0 0 20px rgba(34,211,238,0.04)" : roomId.length > 0 ? "0 0 0 3px rgba(34,211,238,0.04)" : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              <AnimatePresence>
                {roomId.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] tracking-wider"
                    style={{ color: roomId.length === 10 ? "#22d3ee" : "#3f3f46" }}
                  >
                    {roomId.length}/10
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handleJoinRoom}
              disabled={roomId.length !== 10}
              className="w-full rounded-xl text-sm py-3 tracking-wide transition-all disabled:cursor-not-allowed"
              style={{
                background: roomId.length === 10 ? "#161618" : "transparent",
                border: `1px solid ${roomId.length === 10 ? "#27272a" : "#141416"}`,
                color: roomId.length === 10 ? "#a1a1aa" : "#3f3f46",
              }}
              whileHover={roomId.length === 10 ? { scale: 1.015, color: "#e4e4e7" } : {}}
              whileTap={roomId.length === 10 ? { scale: 0.975 } : {}}
            >
              Connect →
            </motion.button>
          </div>
        </motion.div>

        {/* Spec strip */}
        <motion.div variants={stagger.item} className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: "WebRTC P2P" },
            { label: "Zero Storage" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-center rounded-xl py-2.5 px-2"
              style={{ background: "#0d0d0f", border: "1px solid #141416" }}
            >
              <span className="text-[10px] text-zinc-700 tracking-[0.12em] text-center">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}