// signalingServer.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("offer", (offer, to) => {
    io.to(to).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, to) => {
    io.to(to).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate, to) => {
    io.to(to).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Signaling server running on http://localhost:3000");
});
