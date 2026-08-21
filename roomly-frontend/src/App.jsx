import "./App.css";
import { useEffect, useState } from "react";
import JoinCreateChat from "./components/JoinCreateChat";
import ChatPage from "./components/ChatPage";

function App() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("roomly_user");
    const room = localStorage.getItem("roomly_room");

    if (user && room) {
      setHasSession(true);
    }
  }, []);

  if (hasSession) {
    return <ChatPage />;
  }

  return <JoinCreateChat />;
}

export default App;