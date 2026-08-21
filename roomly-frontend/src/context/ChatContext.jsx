import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const [roomId, setRoomId] = useState(
    localStorage.getItem("roomly_room") || ""
  );

  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("roomly_user") || ""
  );

  const [connected, setConnected] = useState(false);

  const updateRoomId = (id) => {
    setRoomId(id);
    localStorage.setItem("roomly_room", id);
  };

  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem("roomly_user", user);
  };

  const clearChatSession = () => {
    setRoomId("");
    setCurrentUser("");
    setConnected(false);

    localStorage.removeItem("roomly_room");
    localStorage.removeItem("roomly_user");
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