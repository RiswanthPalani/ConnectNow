import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(
    () => io("https://connectnow-o3t8.onrender.com"),
    // () => io("localhost:8000"),
    []
  );

  socket.on("connect", () => {
    console.log("Connected to Signalling server");
  });

  socket.on("connect_error", (error) => {
    console.error("Signalling Server Connection Error:", error);
  });

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
