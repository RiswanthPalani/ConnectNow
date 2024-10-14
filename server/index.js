// Contributors:  Rimuru Tempest
//                Yuu Otasaka

const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: {
    origin: "https://connectnow7.vercel.app", // Allow only your frontend URL
    // origin: "http://localhost:5173",
    // methods: ["GET", "POST"],
    // credentials: true,
  },
});

const emailToSocketIDMap = new Map();
const socketIDToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on('room:join', data => {
    const {email, room} = data;
    emailToSocketIDMap.set(email, socket.id);
    socketIDToEmailMap.set(socket.id, email);
    io.to(room).emit('user:joined', {email, id: socket.id});
    socket.join(room);
    io.to(socket.id).emit('room:join', data);
  });

  socket.on('user:call', ({to, offer}) => {
    io.to(to).emit('incomming:call', {from: socket.id, offer});
  });

  socket.on('call:accepted', ({to, ans}) => {
    io.to(to).emit('call:accepted', {from: socket.id, ans});
  });

  socket.on('peer:nego:needed', ({to, offer}) => {
    io.to(to).emit('peer:nego:needed', {from: socket.id, offer});
  });

  socket.on('peer:nego:done', ({to, ans}) => {
    io.to(to).emit('peer:nego:final', {from: socket.id, ans});
  });
});