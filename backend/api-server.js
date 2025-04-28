const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for rooms (in production, use a database)
const rooms = new Map();

// Check if a group exists
app.post('/api', (req, res) => {
    const { action, uuid } = req.body;
    
    if (action === 'groups_exists') {
        const room = rooms.get(uuid);
        if (room) {
            res.json({
                statusCode: 200,
                body: JSON.stringify({
                    data: {
                        Item: {
                            link: room.link,
                            uuid: uuid
                        }
                    }
                })
            });
        } else {
            res.json({
                statusCode: 404,
                body: JSON.stringify({
                    data: null
                })
            });
        }
    } else {
        res.status(400).json({
            statusCode: 400,
            body: JSON.stringify({
                error: 'Invalid action'
            })
        });
    }
});

// Create a new room
app.post('/api/rooms', (req, res) => {
    const { link } = req.body;
    const roomId = uuidv4();
    
    rooms.set(roomId, {
        link,
        createdAt: new Date()
    });
    
    res.json({
        statusCode: 200,
        body: JSON.stringify({
            data: {
                roomId,
                link
            }
        })
    });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server is running on port ${PORT}`);
}); 