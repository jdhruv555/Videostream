const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active rooms and their participants
const rooms = new Map();

// Log active rooms periodically
setInterval(() => {
  console.log('Active rooms:', Array.from(rooms.keys()));
  console.log('Total rooms:', rooms.size);
}, 30000);

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send a ping to verify connection
    ws.send(JSON.stringify({ action: 'ping', message: 'Connected to server' }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            switch (data.action) {
                case 'create-group':
                    console.log('Creating group with data:', data);
                    handleCreateGroup(ws, data);
                    break;
                case 'join':
                    console.log('Joining group with data:', data);
                    handleJoinGroup(ws, data);
                    break;
                case 'ping':
                    console.log('Received ping from client');
                    ws.send(JSON.stringify({ action: 'pong', message: 'Server received ping' }));
                    break;
                default:
                    console.log('Unknown action:', data.action);
                    ws.send(JSON.stringify({ 
                        status: 400, 
                        message: `Unknown action: ${data.action}` 
                    }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ 
                status: 500, 
                message: 'Error processing message',
                error: error.message
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Clean up rooms when participants leave
        for (const [roomId, room] of rooms.entries()) {
            const index = room.participants.findIndex(p => p.ws === ws);
            if (index > -1) {
                console.log(`Removing participant from room ${roomId}`);
                room.participants.splice(index, 1);
                if (room.participants.length === 0) {
                    rooms.delete(roomId);
                    console.log('Room deleted:', roomId);
                } else {
                    broadcastToRoom(roomId, {
                        status: 200,
                        names: room.participants.map(p => p.name)
                    });
                }
            }
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function handleCreateGroup(ws, data) {
    const { 'room-id': roomId, link, name } = data;
    console.log('Creating room:', roomId, 'with link:', link);
    
    if (!roomId || !link || !name) {
        console.error('Missing required fields:', { roomId, link, name });
        ws.send(JSON.stringify({
            status: 400,
            message: 'Missing required fields'
        }));
        return;
    }
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            link,
            participants: [{ ws, name }]
        });
        console.log('Room created successfully:', roomId);
        
        ws.send(JSON.stringify({
            status: 200,
            message: 'Room created successfully'
        }));
    } else {
        console.log('Room already exists:', roomId);
        ws.send(JSON.stringify({
            status: 400,
            message: 'Room already exists'
        }));
    }
}

function handleJoinGroup(ws, data) {
    const { 'room-id': roomId, name } = data;
    console.log('Joining room:', roomId, 'with name:', name);
    
    if (!roomId || !name) {
        console.error('Missing required fields:', { roomId, name });
        ws.send(JSON.stringify({
            status: 400,
            message: 'Missing required fields'
        }));
        return;
    }
    
    if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.participants.push({ ws, name });
        console.log('User joined room successfully:', roomId);
        
        // Notify all participants about the new join
        broadcastToRoom(roomId, {
            status: 200,
            names: room.participants.map(p => p.name)
        });
    } else {
        console.log('Room not found:', roomId);
        ws.send(JSON.stringify({
            status: 404,
            message: 'Room not found'
        }));
    }
}

function broadcastToRoom(roomId, message) {
    const room = rooms.get(roomId);
    if (room) {
        console.log('Broadcasting to room:', roomId, 'message:', message);
        room.participants.forEach(({ ws }) => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(JSON.stringify(message));
                } catch (error) {
                    console.error('Error broadcasting to participant:', error);
                }
            }
        });
    }
}

const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
}); 