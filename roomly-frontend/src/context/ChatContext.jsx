import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const [roomId, setRoomId] = useState(
    sessionStorage.getItem("roomId") || ""
  );

  const [currentUser, setCurrentUser] = useState(
    sessionStorage.getItem("currentUser") || ""
  );

  const [connected, setConnected] = useState(false);

  const updateRoomId = (id) => {
    setRoomId(id);
    sessionStorage.setItem("roomId", id);
  };

  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem("currentUser", user);
  };

  const clearChatSession = () => {
    setRoomId("");
    setCurrentUser("");
    setConnected(false);

    sessionStorage.removeItem("roomId");
    sessionStorage.removeItem("currentUser");
  };

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        setConnected,
        setRoomId: updateRoomId,
        setCurrentUser: updateCurrentUser,
        clearChatSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);

export default useChatContext;