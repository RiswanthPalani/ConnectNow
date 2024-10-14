import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { Snackbar, Alert } from "@mui/material";

// Import MUI components
import { Box, Button, Grid, Typography, Container, Paper } from "@mui/material";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const toggleAudio = () => {
    myStream.getAudioTracks()[0].enabled = isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    myStream.getVideoTracks()[0].enabled = isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    setSnackbarOpen(true); // Show snackbar
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: "user", // Or "environment" for the front-facing camera
      },
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      console.log(`Incoming Call`, from, offer);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Room: {remoteSocketId ? "Connected" : "Waiting for others..."}
        </Typography>

        <Box sx={{ my: 2 }}>
          {remoteSocketId && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCallUser}
              sx={{ mr: 2 }}
            >
              Call
            </Button>
          )}
          {myStream && (
            <Button variant="contained" color="secondary" onClick={sendStreams}>
              Send Stream
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          {myStream && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">My Stream</Typography>
              <ReactPlayer
                playing
                muted // Keep your own stream muted so the remote user doesn't hear your voice
                height="100%"
                width="100%"
                url={myStream}
                style={{ transform: "scaleX(-1)" }} // Flip the local video
              />
            </Grid>
          )}
          {remoteStream && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Remote Stream</Typography>
              <ReactPlayer
                playing
                muted={false} // Do NOT mute the remote stream so you can hear their voice
                height="100%"
                width="100%"
                url={remoteStream}
                style={{ transform: "scaleX(-1)" }} // Flip the local video
              />
            </Grid>
          )}
        </Grid>
        <Box sx={{ my: 2 }}>
          <Button variant="contained" onClick={toggleAudio} sx={{ mr: 2 }}>
            {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
          </Button>
          <Button variant="contained" onClick={toggleVideo}>
            {isVideoMuted ? "Start Video" : "Stop Video"}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info">
          A user has joined the room.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomPage;
