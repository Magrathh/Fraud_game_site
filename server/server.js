// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// --- In-Memory Storage ---
const rooms = {};
const activeTimers = {}; // Separate storage for timer objects to prevent crashes

// --- Connection Handler ---
io.on('connection', (socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  // --- Helper Functions ---
  const updateRoomData = (roomId) => {
    if (rooms[roomId]) {
      io.to(roomId).emit('updateRoom', rooms[roomId]);
    }
  };

  const checkAndManageTimer = (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    const playerCount = room.players.length;
    const timerExists = activeTimers[roomId];

    // Stop timer if player count drops
    if (playerCount < 8 && timerExists) {
        console.log(`Room ${roomId}: Player count fell below 8. Timer stopped.`);
        clearInterval(activeTimers[roomId]);
        delete activeTimers[roomId];
        room.countdown = null;
        io.to(roomId).emit('timerUpdate', null);
        return;
    }

    // Start 80s timer
    if (playerCount >= 8 && playerCount < 16 && !timerExists) {
        console.log(`Room ${roomId}: 8+ players. Starting 80s timer.`);
        room.countdown = 80;
        io.to(roomId).emit('timerUpdate', room.countdown);
        activeTimers[roomId] = setInterval(() => {
            if (!rooms[roomId]) { // Safety check if room was deleted during timer
                clearInterval(activeTimers[roomId]);
                delete activeTimers[roomId];
                return;
            }
            rooms[roomId].countdown--;
            io.to(roomId).emit('timerUpdate', rooms[roomId].countdown);

            if (rooms[roomId].countdown <= 0) {
                clearInterval(activeTimers[roomId]);
                delete activeTimers[roomId];
                rooms[roomId].status = 'playing';
                io.to(roomId).emit('gameStarting');
            }
        }, 1000);
        return;
    }
    
    // Accelerate to 10s timer
    if (playerCount === 16 && timerExists && room.countdown > 10) {
        console.log(`Room ${roomId}: Full! Accelerating timer to 10s.`);
        clearInterval(activeTimers[roomId]);
        delete activeTimers[roomId];
        room.countdown = 10;
        io.to(roomId).emit('timerUpdate', room.countdown);
        activeTimers[roomId] = setInterval(() => {
            if (!rooms[roomId]) { // Safety check
                clearInterval(activeTimers[roomId]);
                delete activeTimers[roomId];
                return;
            }
            rooms[roomId].countdown--;
            io.to(roomId).emit('timerUpdate', rooms[roomId].countdown);

            if (rooms[roomId].countdown <= 0) {
                clearInterval(activeTimers[roomId]);
                delete activeTimers[roomId];
                rooms[roomId].status = 'playing';
                io.to(roomId).emit('gameStarting');
            }
        }, 1000);
    }
  };


  // --- Socket Event Handlers ---

  socket.on('createRoom', (settings) => {
    const roomId = `room_${Date.now()}`;
    const password = settings.isPrivate ? Math.random().toString(36).substring(2, 7) : null;
    
    rooms[roomId] = {
      id: roomId,
      name: settings.roomName,
      ownerId: socket.id,
      players: [{ id: socket.id, username: `Player-${socket.id.substring(0, 4)}` }],
      isPrivate: settings.isPrivate,
      password: password,
      status: 'waiting',
      countdown: null,
    };
    socket.emit('roomCreated', { roomId, password: rooms[roomId].password });
  });

  socket.on('getRoomData', ({ roomId }) => {
    const room = rooms[roomId];
    if (room) {
        socket.join(roomId);
        socket.emit('updateRoom', room);
    } else {
        socket.emit('error', 'Could not find game data. It may have been deleted.');
    }
  });

  socket.on('joinRoom', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) { return socket.emit('error', 'Room not found.'); }
    
    const isAlreadyIn = room.players.some(p => p.id === socket.id);
    if (!isAlreadyIn) {
      room.players.push({ id: socket.id, username: `Player-${socket.id.substring(0, 4)}` });
    }
    socket.join(roomId);
    updateRoomData(roomId);
    checkAndManageTimer(roomId);
  });
  
  socket.on('joinPublicRoom', () => {
    let availableRoomId = null;
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (!room.isPrivate && room.players.length < 16 && room.status === 'waiting') {
        availableRoomId = roomId;
        break;
      }
    }
    if (availableRoomId) {
      socket.emit('joinSuccess', { roomId: availableRoomId });
    } else {
      socket.emit('joinError', 'No public rooms available. Try again later.');
    }
  });

  socket.on('joinPrivateRoom', ({ roomName, password }) => {
    let foundRoomId = null;
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.name === roomName && room.password === password && room.status === 'waiting') {
        if (room.players.length < 16) { 
            foundRoomId = roomId;
        } else {
            return socket.emit('joinError', 'This room is already full.');
        }
        break;
      }
    }
    if (foundRoomId) {
      socket.emit('joinSuccess', { roomId: foundRoomId });
    } else {
      socket.emit('joinError', 'Incorrect room name or password.');
    }
  });
  
  socket.on('leaveRoom', ({ roomId }) => {
    const room = rooms[roomId];
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      socket.leave(roomId);
      
      if (room.players.length > 0) {
        updateRoomData(roomId);
        checkAndManageTimer(roomId);
      } else {
        // Delete room if it becomes empty
        if(activeTimers[roomId]) clearInterval(activeTimers[roomId]);
        delete activeTimers[roomId];
        delete rooms[roomId];
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[-] User disconnected: ${socket.id}`);
    
    const roomLeftId = Array.from(socket.rooms).find(roomName => roomName.startsWith('room_'));

    if (roomLeftId && rooms[roomLeftId]) {
      const room = rooms[roomLeftId];
      const isOwner = room.ownerId === socket.id;

      if (isOwner) {
        // If the owner disconnects, destroy the room
        console.log(`Owner of room ${roomLeftId} disconnected. Deleting room.`);
        io.to(roomLeftId).emit('roomDeleted');
        if(activeTimers[roomLeftId]) clearInterval(activeTimers[roomLeftId]);
        delete activeTimers[roomLeftId];
        delete rooms[roomLeftId];
      } else {
        // If a regular player disconnects, just remove them
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length > 0) {
          updateRoomData(roomLeftId);
          checkAndManageTimer(roomLeftId);
        } else {
          // If the last player leaves, delete the empty room
          console.log(`Room ${roomLeftId} is now empty. Deleting.`);
          if(activeTimers[roomLeftId]) clearInterval(activeTimers[roomLeftId]);
          delete activeTimers[roomLeftId];
          delete rooms[roomLeftId];
        }
      }
    }
  });
});

// --- Server Listener ---
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
