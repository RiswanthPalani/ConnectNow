import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

// Import MUI components
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from "@mui/material";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const navigate = useNavigate();
  const socket = useSocket();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleRoomJoin = useCallback(
    (data) => {
      const { room } = data;
      navigate(`./room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleRoomJoin);
    return () => {
      socket.off("room:join", handleRoomJoin);
    };
  }, [socket, handleRoomJoin]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Join a Room
        </Typography>
        <Box component="form" onSubmit={handleSubmitForm} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email ID"
            type="email"
            variant="outlined"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Room Number"
            type="text"
            variant="outlined"
            margin="normal"
            required
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Join
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LobbyScreen;
