# 🚀 FileDrop - Peer-to-Peer File Sharing

FileDrop is a high-performance peer-to-peer file transfer web application built using WebRTC. It allows users to send files directly between devices without storing any data on a server.

No uploads. No limits (except your bandwidth 😏). Just pure P2P transfer.

---

## ✨ Features

- 🔗 **Direct P2P Transfer** (WebRTC Data Channels)
- 📦 **Chunked File Streaming (64KB chunks)** for efficient large file transfer
- ⚡ **Zero Server Storage**
- 🧠 **Backpressure Handling** using bufferedAmount control
- 📊 **Real-time Upload & Download Progress**
- 🧾 **Room-based Connection System**
- 🧑‍🤝‍🧑 **2-Peer Secure Sessions**
- ❌ **Transfer Abort & Recovery Handling**
- 📥 **Native File Save (File System Access API + StreamSaver fallback)**

---

## 🏗️ Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS
- Framer Motion

### Backend (Signaling Server)
- Node.js
- WebSocket (ws)
- Express

### Core Technologies
- WebRTC (RTCPeerConnection + DataChannel)
- Streams API
- StreamSaver.js

---

## ⚙️ How It Works

1. User creates a room (random 10-char ID)
2. Second user joins using the same room ID
3. WebSocket signaling server exchanges SDP (offer/answer)
4. WebRTC connection is established
5. File is:
   - split into chunks (64KB)
   - streamed over DataChannel
6. Receiver writes directly to disk (no RAM explosion 💀)

> Signaling server is only used for connection setup — no file passes through it.

---

## 📁 Project Structure

client/
 ├── hooks/
 │   ├── useWebRTC.ts
 │   └── useFileTransfer.ts
 ├── components/
 │   ├── FileDropZone.tsx
 │   ├── TransferProgress.tsx
 │   ├── IncomingFileDialog.tsx
 │   └── ErrorModal.tsx
 └── app/

server/
 └── server.ts

---

## 🚀 Getting Started

### 1. Clone the repo

git clone https://github.com/kanishk1184/P2P-File-Share.git
cd filedrop

---

### 2. Setup Backend

cd server
npm install
npm run dev

Server runs on:
http://localhost:1908

---

### 3. Setup Frontend

cd client
npm install
npm run dev

---

### 4. Environment Variables

Create `.env` in frontend:

NEXT_PUBLIC_BACKEND_URL=http://localhost:1908
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1908

---

## 🧪 How to Use

1. Open app in two devices
2. Click **Create Room** on one
3. Share room ID
4. Join from second device
5. Drag & drop file → Done ✅

---

## ⚠️ Limitations

- Only **2 peers per room**
- Requires stable internet for WebRTC
- Large files depend on network speed

---

## 💡 Future Improvements

- Multi-peer rooms
- Resume interrupted transfers
- End-to-end encryption layer
- File previews
- Mobile optimization

---

## 🧑‍💻 Author

Made with caffeine & questionable life choices ☕  
by **Kanishk**

---

## ⭐ Give a Star

If you liked this project, drop a ⭐ — helps more than you think!
