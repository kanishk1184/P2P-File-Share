import { useRef, useState, useCallback } from "react";

export function useFileTransfer(dataChannel: React.RefObject<RTCDataChannel | null>) {
  const [incomingRequest, setIncomingRequest] = useState<{ name: string; size: number; type: string } | null>(null);

  // Prgress bar
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  
  const receivedBytes = useRef<number>(0);
  const activeDownload = useRef<{ name: string; size: number } | null>(null);
  const uploadingFile = useRef<File | null>(null);
  const fileStream = useRef<any>(null); 
  const streamSaverWriter = useRef<any>(null);

  const isAborting = useRef <boolean> (false);

  
  const handleDataMessage = useCallback(async (e: MessageEvent) => {
    if (typeof e.data === "string") {
      const msg = JSON.parse(e.data);

      if (msg.type === "file-meta") {
        setIncomingRequest({
          name: msg.name,
          size: msg.size,
          type: msg.fileType,
        });
      } else if (msg.type === "file-eof") {
        if (fileStream.current) {
          await fileStream.current.close();
          fileStream.current = null;
        } else if (streamSaverWriter.current) {
          await streamSaverWriter.current.close();
          streamSaverWriter.current = null;
        }
        console.log("File downloaded successfully");

        // Reset progress bar
        setIsDownloading(false);
        setDownloadProgress(0);
        activeDownload.current = null;

      } else if (msg.type === "stream-abort") {
        console.log("Peer Rejected/cancelled the transfer!!");
        await abortAndCleanup();
        alert("Peer Rejected/cancelled the transfer!!");
      } else if (msg.type === "stream-ready") {
        if (uploadingFile.current) {
          startStreaming(uploadingFile.current);
        }
      }
    } else if (e.data instanceof ArrayBuffer) {

      try{
        if (fileStream.current) {
          await fileStream.current.write(e.data);
        } else if (streamSaverWriter.current) {
          await streamSaverWriter.current.write(new Uint8Array(e.data));
        }

        if (activeDownload.current){
          receivedBytes.current += e.data.byteLength;

          const currentPercent = Math.round((receivedBytes.current/activeDownload.current.size)*100);

          setDownloadProgress((prev)=> (currentPercent > prev ? currentPercent : prev));
        }
      } catch (err) {
        console.error("Stream write failed!!", err);

        if (isAborting.current) return;

        isAborting.current = true;

        if (dataChannel.current?.readyState === "open"){
          dataChannel.current.send(JSON.stringify({ type: "stream-abort"}));
        }

        await abortAndCleanup();
        alert("Download was cancelled");
      }
    }
  }, []);

  async function startStreaming(file: File) {
    const CHUNK_SIZE = 65536; // 64KB
    const BUFFER_THRESHOLD = 1048576; // 1MB
    let offset = 0;
    let lastPaint = 0;


    dataChannel.current!.bufferedAmountLowThreshold = BUFFER_THRESHOLD;

    setIsUploading(true);
    setUploadProgress(0);

    while (offset < file.size) {

      if (!dataChannel.current || dataChannel.current.readyState !== "open" || !uploadingFile.current){
        console.log("Transfer aborted or channel closed. Halting loop");
        break;
      }


      if (dataChannel.current!.bufferedAmount > BUFFER_THRESHOLD) {
        await new Promise<void>((resolve) => {
          dataChannel.current!.onbufferedamountlow = () => {
            dataChannel.current!.onbufferedamountlow = null;
            resolve();
          };
        });
      }

      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await slice.arrayBuffer();
      
      try{
        dataChannel.current!.send(buffer);
        offset += CHUNK_SIZE;

        const currentPercent = Math.round((offset/file.size)*100);
        if (currentPercent > lastPaint){
          setUploadProgress(currentPercent);
          lastPaint = currentPercent;
        }
      } catch (err) {
        console.error("Failed to send chunk.", err);
        break;
      }
    }

    if (offset >= file.size && dataChannel.current?.readyState === "open"){
      dataChannel.current!.send(JSON.stringify({ type: "file-eof" }));
      console.log("Finished sending all chunks");
    }

    uploadingFile.current = null;
    setIsUploading(false);
    setUploadProgress(0);
  };

  async function abortAndCleanup() {
    console.warn("Aborting transfer and cleaning up streams!!!");

    if (fileStream.current){
      try {
        await fileStream.current.abort();
      }
      catch (e) {}
      fileStream.current = null;
    }

    if (streamSaverWriter.current){
      try {
        await streamSaverWriter.current.abort();
      }
      catch (e) {}
      streamSaverWriter.current = null;
    }

    uploadingFile.current = null;
    activeDownload.current = null;
    isAborting.current = false;
    setIncomingRequest(null);
    setIsDownloading(false);
    setDownloadProgress(0);
    setIsUploading(false);
    setUploadProgress(0);
  }

  const handleFileSelect = (file: File) => {
    if (!dataChannel.current || dataChannel.current.readyState !== "open") return;

    console.log("File captured! Ready to process:", file.name, file.size);
    uploadingFile.current = file;

    dataChannel.current.send(
      JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        fileType: file.type,
      })
    );
  };

  const declineFile = () => {
    if (dataChannel.current) {
      dataChannel.current.send(JSON.stringify({ type: "stream-abort" }));
    }
    setIncomingRequest(null);
  };

  const acceptFile = async () => {
    if (!incomingRequest || !dataChannel.current) return;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: incomingRequest.name,
        });

        fileStream.current = await handle.createWritable();
        
        // Download progress bar setup
        receivedBytes.current = 0;
        setDownloadProgress(0);
        setIsDownloading(true);
        activeDownload.current = {
          name: incomingRequest.name,
          size: incomingRequest.size
        }

        dataChannel.current.send(JSON.stringify({ type: "stream-ready" }));
        setIncomingRequest(null);
      } catch (err) {
        console.log("User Cancelled the OS save dialog", err);
        dataChannel.current.send(JSON.stringify({ type: "stream-abort" }));
        setIncomingRequest(null);
      }
    } else {
      const streamSaver = (await import("streamsaver")).default;

      streamSaver.mitm = "/mitm.html"

      const file = streamSaver.createWriteStream(incomingRequest.name, {
        size: incomingRequest.size,
      });

      streamSaverWriter.current = file.getWriter();

      // Download progress bar setup
      receivedBytes.current = 0;
      setDownloadProgress(0);
      setIsDownloading(true);
      activeDownload.current = {
        name: incomingRequest.name,
        size: incomingRequest.size
      }

      dataChannel.current.send(JSON.stringify({ type: "stream-ready" }));
      setIncomingRequest(null);
    }
  };

  return {
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
    isDownloading
  };
}