"use client";

import { useParams } from "next/navigation";
import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

//(Hooks)
import { useWebRTC } from "@/components/hooks/useWebRTC";
import { useFileTransfer } from "@/components/hooks/useFileTransfer";

//(Components)
import { ErrorModal } from "@/components/modals/ErrorModal";
import { IncomingFileDialog } from "@/components/modals/IncomingFileDialog";
import { RoomHeader } from "@/components/room/RoomHeader";
import { FileDropZone } from "@/components/room/FileDropZone";
import { TransferProgress } from "@/components/room/TransferProgress";


export default function Page() {
  const params = useParams<{ roomId: string }>();
  const { roomId } = params;

  // The Bridge: This ref connects our WebRTC network pipe to our File Streaming logic
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Initialize the File Transfer engine
  const {
    incomingRequest,
    activeDownload,
    handleDataMessage,
    handleFileSelect,
    acceptFile,
    declineFile,
    abortAndCleanup,
    uploadProgress,
    isUploading,
    downloadProgress,
    isDownloading,
  } = useFileTransfer(dataChannelRef);

  const activeState = useRef({ isUploading, isDownloading, activeDownload });

  // Initialize the WebRTC connection engine
  const { status, errorMessage } = useWebRTC(
    roomId,
    dataChannelRef,
    handleDataMessage,
    abortAndCleanup,
  );

  useEffect(() => {
    activeState.current = { isUploading, isDownloading, activeDownload };
  }, [isUploading, isDownloading, activeDownload]);

  useEffect(() => {
    // Just to handle sudden quit
    const handleUnload = () => {
      const state = activeState.current;
      if (state.isUploading || state.isDownloading || state.activeDownload) {
        if (dataChannelRef.current?.readyState === "open") {
          dataChannelRef.current.send(JSON.stringify({ type: "stream-abort" }));
        }
      }
      window.addEventListener("beforeunload", handleUnload);
      return () => {
        handleUnload;
        window.removeEventListener("beforeunload", handleUnload);
      };
    };
  }, []);

  // --- UI RENDERING ---

  // 1. Render Error Layout if room is full or connection drops
  if (status === "error") {
    return <ErrorModal message={errorMessage} />;
  }

  // 2. Render Main Dashboard
  return (
    <div className="relative min-h-screen bg-[#080809] flex flex-col items-start justify-start sm:items-center sm:justify-center px-0 sm:px-4 py-0 sm:py-12 overflow-hidden font-mono">

      {/* Subtle top glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-125 h-50 opacity-[0.08]"
        style={{ background: "radial-gradient(ellipse at top, #22d3ee, transparent 70%)", filter: "blur(40px)" }} />

      {/* Corner label */}
      <span className="fixed top-5 left-5 text-[10px] text-zinc-800 tracking-[0.2em] z-10 hidden sm:block">FILEDROP//ROOM</span>

      {/* Card */}
      <div
        className="relative z-10 w-full sm:max-w-140 sm:rounded-2xl overflow-hidden min-h-screen sm:min-h-0"
        style={{ background: "#0d0d0f", border: "1px solid transparent", boxShadow: "none" }}
      >
        {/* Apply card styles only on sm+ */}
        <style>{`
          @media (min-width: 640px) {
            .room-card {
              border-color: #1a1a1e !important;
              box-shadow: 0 0 0 1px rgba(255,255,255,0.02), 0 24px 64px rgba(0,0,0,0.5) !important;
              min-height: unset !important;
            }
          }
        `}</style>
        <div className="room-card w-full h-full" style={{ minHeight: "inherit" }}>
          <RoomHeader roomId={roomId} status={status} />

          <div className="p-5 sm:p-7">
            <FileDropZone
              status={status}
              roomId={roomId}
              onFileSelect={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          <TransferProgress
            isActive={isUploading}
            progress={uploadProgress}
            type="upload"
          />
          <TransferProgress
            isActive={isDownloading}
            progress={downloadProgress}
            type="download"
            fileName={activeDownload?.current?.name}
          />
        </div>
      </div>

      <p className="relative z-10 mt-5 text-[10px] text-zinc-800 tracking-[0.15em] text-center hidden sm:block">
        WebRTC · No data stored
      </p>

      {/* Incoming file dialog */}
      <AnimatePresence>
        {incomingRequest && (
          <IncomingFileDialog
            request={incomingRequest}
            onAccept={acceptFile}
            onDecline={declineFile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}