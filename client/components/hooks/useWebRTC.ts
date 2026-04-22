import { Coming_Soon } from "next/font/google";
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
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

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
        addCandidates();
      } else if (type === "answer") {
        if (!peerConn.current) {
          console.log("No RTC Connection found to set Remote Desc...");
        } else {
          await peerConn.current.setRemoteDescription(payload);
          addCandidates();
        }
      } else if (type === "ice-candidate") {
        console.log("Adding ICE candidate");
        if (!peerConn.current) {
          console.log("No peer Connection to add ice candidate!!");
        } else if (peerConn.current.remoteDescription && peerConn.current.remoteDescription.type) {
          await peerConn.current.addIceCandidate(payload);

        } else {
          iceCandidateQueue.current.push(payload);
        }
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
        console.warn("WebRTC connection physically dropped!", peerConn.current.connectionState);
        onDisconnectRef.current();
        setStatus("waiting")
      } else if (peerConn.current?.connectionState === "connected") {
        setStatus("connected");
      }
    };

    peerConn.current.onicecandidate = (e) => {
      if (e.candidate) {
        ws.current!.send(
          JSON.stringify({
            type: "ice-candidate",
            roomId,
            payload: e.candidate
          })
        )
      }
    };

  }

  function addCandidates() {
    if (!peerConn.current) {
      console.log("No peerConnection Found");
      return;
    }

    iceCandidateQueue.current.forEach((candidate) => {
      peerConn.current!.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    });

    iceCandidateQueue.current = [];
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
    if (!peerConn.current) {
      console.log("No RTCwebConnection initialized...");
      return;
    }

    try {
      console.log("Creating offer and data channel");
      dataChannelRef.current = peerConn.current.createDataChannel("Lane");
      setupDataChannel();

      const offer = await peerConn.current.createOffer();
      await peerConn.current.setLocalDescription(offer);

      ws.current!.send(JSON.stringify({
        type: "offer",
        roomId,
        payload: peerConn.current.localDescription
      }))
    }
    catch (err) {
      console.error("Error creating offer", err);
    }

  };

  const createAnswer = async (remoteDesc: RTCSessionDescription) => {
    if (!peerConn.current) {
      console.log("No RTCwebConnection Found...");
      return;

    }

    try {
      console.log("Creating an answer and settting up data channel!!");

      await peerConn.current.setRemoteDescription(remoteDesc);
      
      peerConn.current.ondatachannel = (e) => {
        dataChannelRef.current = e.channel;
        setupDataChannel();
      };
  
      const answer = await peerConn.current.createAnswer();
      await peerConn.current.setLocalDescription(answer);
  
      ws.current!.send(
        JSON.stringify({
          type: "answer",
          roomId,
          payload: peerConn.current.localDescription,
        })
      );

    } catch (error) {
      console.error("Cant create answer...", error);
    }

  };

  return { status, errorMessage };
}