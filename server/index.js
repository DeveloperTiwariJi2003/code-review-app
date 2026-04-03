const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const roomRoutes = require('./routes/room');
const codeRoutes = require('./routes/code');
const Room = require('./models/Room');
app.use(express.static(path.join(__dirname, '../client')));
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use('/api/rooms', roomRoutes);
app.use('/api/code',codeRoutes);
app.get('/', (req, res) => {
  res.send("Server is running")
})
const port = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("unable to connect", err));

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const users = {};
io.on('connection', (socket) => {
  socket.on('join-room',async ({ roomId, username }) => {
    socket.join(roomId);

    const room = await Room.findOne({ roomId });
  if (room) {
    socket.emit('load-code', room.code);  // send saved code to this user only
  }

    users[socket.id] = {username, roomId };
    const roomUsers = Object.values(users)
      .filter(user => user.roomId === roomId)
      .map(user => user.username);
     io.to(roomId).emit('room-users', roomUsers); 
  })
  socket.on('code-change',async ({ roomId, code }) => {

    socket.to(roomId).emit('code-update', code);// this shows code in another user
    await Room.findOneAndUpdate({ roomId }, { code }, { upsert: true }); // this saves code in DB
  });
  socket.on('disconnect', () => {
  const user = users[socket.id];
  if (user) {
    const { roomId } = user;
    delete users[socket.id];
    const roomUsers = Object.values(users)
      .filter(u => u.roomId === roomId)
      .map(u => u.username);
    io.to(roomId).emit('room-users', roomUsers);
  }
  console.log("User disconnected:", socket.id);
});
})
server.listen(port, () => {
  console.log("server is up at port ", port);

})