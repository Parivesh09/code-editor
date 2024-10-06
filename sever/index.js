// /server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Your React app URL
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/code_editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Join specific project room
  socket.on('joinRoom', ({ projectId }) => {
    socket.join(projectId);
    console.log(`${socket.id} joined room ${projectId}`);
  });

  // Listen for code changes
  socket.on('codeUpdate', ({ projectId, code }) => {
    // Broadcast code changes to all clients in the room
    socket.to(projectId).emit('codeUpdate', code);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
