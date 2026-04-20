import { useEffect, useRef, useState } from "react";

const wsURL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

export type ConnectionState = "connecting" | "waiting" | "connected" | "error";

export function useWebRTC(
  roomId: string,
  dataChannelRef: React.RefObject<RTCDataChannel | null>,
  onMessage: (e: MessageEvent) => void,
  onDisconnect: () => void,
) {
  const [status, setStatus] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState("");

  const ws = useRef<WebSocket | null>(null);
  const peerConn = useRef<RTCPeerConnection | null>(null);

  // STALE CLOSURE FIX: Always keep the latest message handler in a ref
  const onMessageRef = useRef(onMessage);
  const onDisconnectRef = useRef(onDisconnect);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onDisconnectRef.current = onDisconnect;
  }, [onDisconnect]);

  useEffect(() => {
    if (ws.current) return;

    const websocket = new WebSocket(wsURL!);
    ws.current = websocket;

    websocket.onmessage = async (e: MessageEvent) => {
      const newMsg = JSON.parse(e.data);
      const { type, payload } = newMsg;

      if (type === "error") {
        setErrorMessage(payload || "This room is currently full.");
        setStatus("error");
      } else if (type === "peer-joined") {
        initializeWebRTC();
        await createOffer();
      } else if (type === "offer") {
        initializeWebRTC();
        await createAnswer(payload);
      } else if (type === "answer") {
        await peerConn.current!.setRemoteDescription(payload);
      } else if (type === "peer-disconnected") {
        alert("Peer disconnected!!");
        await onDisconnectRef.current();

        if (peerConn.current) {
          peerConn.current.close();
          peerConn.current = null;
        }
        if (dataChannelRef.current) {
          dataChannelRef.current.close();
          dataChannelRef.current = null;
        }
        setStatus("waiting");
      }
    };

    websocket.onopen = () => {
      websocket.send(JSON.stringify({ type: "join", roomId }));
      setStatus("waiting");
    };

    return () => {
      websocket?.close();
      peerConn.current?.close();

      ws.current = null;
      peerConn.current = null;
    };
  }, [roomId]);

  function initializeWebRTC() {

    if (peerConn.current) {
      peerConn.current.close();
      peerConn.current = null;
    }

    peerConn.current = new RTCPeerConnection({ iceServers });

    peerConn.current.onconnectionstatechange = () => {
      console.log("WebRTC Status: ", peerConn.current?.connectionState);

      if (peerConn.current?.connectionState === "disconnected" || peerConn.current?.connectionState === "failed") {
        console.warn("WebRTC connection physically dropped!");
        onDisconnectRef.current();
        setStatus("waiting")
      } else if (peerConn.current?.connectionState === "connected") {
        setStatus("connected");
      }
    };

  }


const setupDataChannel = () => {
  if (!dataChannelRef.current) return;

  dataChannelRef.current.binaryType = "arraybuffer";

  dataChannelRef.current.onopen = () => setStatus("connected");
  dataChannelRef.current.onclose = () => {
    setStatus("waiting");
    onDisconnectRef.current?.();
  }

  // We attach the File Transfer logic directly into the open pipe here
  dataChannelRef.current.onmessage = (e) => onMessageRef.current(e);
};

const createOffer = async () => {
  console.log("Creating offer and data channel");
  dataChannelRef.current = peerConn.current!.createDataChannel("Lane");
  setupDataChannel();

  const offer = await peerConn.current!.createOffer();

  peerConn.current!.onicecandidate = (e) => {
    if (!e.candidate) {
      ws.current!.send(
        JSON.stringify({
          type: "offer",
          roomId,
          payload: peerConn.current!.localDescription,
        })
      );
    }
  };

  await peerConn.current!.setLocalDescription(offer);
};

const createAnswer = async (remoteDesc: RTCSessionDescription) => {
  await peerConn.current!.setRemoteDescription(remoteDesc);

  peerConn.current!.ondatachannel = (e) => {
    dataChannelRef.current = e.channel;
    setupDataChannel();
  };

  const answer = await peerConn.current!.createAnswer();

  peerConn.current!.onicecandidate = (e) => {
    if (!e.candidate) {
      ws.current!.send(
        JSON.stringify({
          type: "answer",
          roomId,
          payload: peerConn.current!.localDescription,
        })
      );
    }
  };

  await peerConn.current!.setLocalDescription(answer);
};

return { status, errorMessage };
}