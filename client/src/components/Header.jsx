import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <VideoCallIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Video App
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
