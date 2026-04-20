import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import cors from "cors"

interface ExtWebSocket extends WebSocket {
    roomId ?: string;
}
interface SignalingMessage {
    type: "join" | "offer" | "answer" | "peer-joined" | "peer-disconnected" | "error";
    roomId: string;
    payload?: any;
}
interface broadcastMessage {
    type: "offer" | "answer" | "peer-joined" | "peer-disconnected" | "error";
    payload?: any;
}

const PORT = process.env.PORT || 1908;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const rooms = new Map<string, Set<ExtWebSocket>>();

wss.on("connection", (ws: ExtWebSocket)=>{

    ws.on("message", (messageAsString: string)=>{
        const message: SignalingMessage = JSON.parse(messageAsString);
        const {type, roomId, payload} = message;

        // if the type if offer or answer we need to just relay it to other side for handshake
        if (type === "offer" || type === "answer"){

            broadcastToOther(ws, roomId, {type, payload});
        }
        else if (type === "join"){
            
            // adding to map
            if (!rooms.has(roomId)){
                rooms.set(roomId, new Set<ExtWebSocket>());
            }
            
            const room = rooms.get(roomId);
            if (room){
                // check the size of room
                if (room.size === 2){
                    ws.send(JSON.stringify({
                        type: "error",
                        payload: "Room is full"
                    }))
                    return;
                }
                
                room.add(ws);
                ws.roomId = roomId;

                if (room.size === 2){
                    broadcastToOther(ws, roomId, { type: "peer-joined" });
                }
            }
        }
    })

    ws.on("close", ()=>{
        
        // We need to remove the ws client from our set
        if (ws.roomId && rooms.has(ws.roomId)){
            const room = rooms.get(ws.roomId)!;

            room.delete(ws);

            console.log(`User left room ${ws.roomId}. Remaining Peers: ${room.size}`)

            // tell their buddy that they disconencted
            broadcastToOther(ws, ws.roomId, {type: "peer-disconnected"});

            if (room.size === 0){
                // Delete this room from the map
                rooms.delete(ws.roomId);
                console.log(`Room ${ws.roomId} deleted`);
            }

        }
        
    })


});


function broadcastToOther(ws: ExtWebSocket, roomId: string, message: broadcastMessage){
    const room = rooms.get(roomId);

    if (room){
        for (const client of room){
            if (client !== ws && client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(message));
            }
        }
    }
}

app.use(cors());
// Health-check route
app.get('/', (req, res)=>{
    res.send("Signalling server is alive...");
})

server.listen(Number(PORT), "0.0.0.0", ()=>{
    console.log("Signalling server running on PORT: ", PORT);
})

