require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http"); // Importiamo il modulo HTTP di Node

const { Server } = require("socket.io");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const socketHandler = require("./config/socket/socketHandler"); // Importa il nuovo handler
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permette richieste da qualsiasi origine (per lo sviluppo).
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Permette tutti i metodi che usi. 'OPTIONS' è fondamentale.
    allowedHeaders: ["Content-Type", "Authorization", "body"], // Specifica gli header che sono permessi.
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

socketHandler(io);
app.use(
  cors({
    origin: "*", // Permette richieste da qualsiasi origine (per lo sviluppo).
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Permette tutti i metodi che usi. 'OPTIONS' è fondamentale.
    allowedHeaders: ["Content-Type", "Authorization", "body"], // Specifica gli header che sono permessi.
  }),
);
app.use(express.json());
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/groups", groupRoutes); // Assuming groupRoutes is defined similarly
app.get("/", (req, res) => {
  res.send("<h1>tutto funziona</h1>");
});
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);

server.listen(port, () => {});
