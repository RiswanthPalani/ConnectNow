import { Routes, Route } from "react-router-dom";
import LobbyScreen from "./screens/Lobby";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element = {<LobbyScreen />} />
      </Routes>
    </>
  );
}

export default App;
