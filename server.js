// Import the WebSocket library
const ws = require('ws');

// Create a WebSocket server on port 8080

const PORT = process.env.PORT || 8080;

const server = new ws.Server({ port: PORT });




// Store usernames of connected users
let users = [];

// Handle new connections
server.on('connection', socket => {
    // Listen for messages from the client
    socket.on('message', data => {
        const message = JSON.parse(data);

        if (message.type === 'join') {
            socket.username = message.username;
            users.push(socket.username);

            // Notify all users about the new user
            const joinMessage = `${socket.username} has joined the chat!`;
            broadcast({ type: 'notification', text: joinMessage });

            // Notify the new user about the current users
            const userList = users.length === 1
                ? 'You are the first to join this chat.'
                : `Current users: ${users.join(', ')}`;
            socket.send(JSON.stringify({ type: 'system', text: userList }));
        } else if (message.type === 'message') {
            broadcast({ type: 'message', username: socket.username, text: message.text });
        }
    });

    // Handle user disconnection
    socket.on('close', () => {
        if (socket.username) {
            users = users.filter(user => user !== socket.username);
            const leaveMessage = `${socket.username} has left the chat.`;
            broadcast({ type: 'notification', text: leaveMessage });
        }
    });

    // Broadcast messages to all connected clients
    function broadcast(data) {
        server.clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
});

console.log(`Chat server is running on ws://localhost:${PORT}`);
