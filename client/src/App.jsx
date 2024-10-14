import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import "./App.css";

function App() {
  return (
    <div>
    <Header />
      <Routes>
        <Route path = "/" element = {<LobbyScreen />} />
        <Route path = "/room/:roomId" element = {<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
