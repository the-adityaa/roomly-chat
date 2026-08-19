import React, { useState, useRef, useEffect, useMemo } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { FiHash, FiLogOut, FiCopy, FiCheck, FiUsers } from "react-icons/fi";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import { timeAgo } from "../config/helper";
import { getMessagess } from "../services/RoomService";
import toast from "react-hot-toast";
import { getUserColor, getUserAvatar } from "../utils/chatColor";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import axios from "axios";

const ChatPage = () => {
  const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  const myColor = useMemo(() => getUserColor(currentUser), [currentUser]);

  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, navigate]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessagess(roomId);
        setMessages(data);
      } catch (error) {
        toast.error("Could not load previous messages");
      }
    }
    if (connected) loadMessages();
  }, [connected, roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });

        client.subscribe(`/topic/room/${roomId}/users`, (message) => {
          const response = JSON.parse(message.body);
          setOnlineUsers(response.users || []);
        });

        client.send(
          "/app/join",
          {},
          JSON.stringify({ roomId, username: currentUser })
        );
      });
    };

    if (connected) connectWebSocket();

    return () => {
      if (stompClient?.connected) stompClient.disconnect();
    };
    // connection is intentionally recreated for room changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, connected]);

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${baseURL}/api/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      toast.error("File upload failed");
      return null;
    }
  };

  const sendMessage = async () => {
    if (!stompClient || !connected) return;

    let uploadResponse = null;
    if (selectedFile) {
      uploadResponse = await uploadFile();
      if (!uploadResponse) return;
    }

    if (!input.trim() && !uploadResponse) return;

    const message = {
      sender: currentUser,
      roomId,
      content: input,
      fileUrl: uploadResponse?.fileUrl || null,
      fileName: uploadResponse?.fileName || null,
      messageType: uploadResponse?.messageType || "TEXT",
    };

    stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
    setInput("");
    setSelectedFile(null);

    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleLogout = () => {
    if (stompClient?.connected) {
      stompClient.send(
        "/app/leave",
        {},
        JSON.stringify({ roomId, username: currentUser })
      );
      stompClient.disconnect();
    }

    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy room ID");
    }
  };

  const uniqueUsers = Array.from(new Set(onlineUsers));
  if (currentUser && !uniqueUsers.includes(currentUser)) uniqueUsers.unshift(currentUser);

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span />
            <span />
            <span />
          </div>
          <div>
            <div className="sidebar-brand-name">Roomly</div>
            <div className="sidebar-brand-sub">Real-time chat</div>
          </div>
        </div>

        <div className="sidebar-room">
          <div className="sidebar-section-label">ROOM</div>
          <div className="room-card">
            <div className="room-card-icon"><FiHash /></div>
            <div className="room-card-info">
              <strong>{roomId}</strong>
              <span>{uniqueUsers.length} {uniqueUsers.length === 1 ? "member" : "members"}</span>
            </div>
            <button onClick={copyRoomId} className="icon-button small" title="Copy room ID">
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
        </div>

        <div className="members-section">
          <div className="sidebar-section-label members-title">
            <span>MEMBERS</span>
            <span className="member-count">{uniqueUsers.length}</span>
          </div>

          <div className="member-list">
            {uniqueUsers.map((user) => {
              const color = getUserColor(user);
              const isYou = user === currentUser;

              return (
                <div className={`member-row ${isYou ? "member-row-you" : ""}`} key={user}>
                  <div className="avatar-wrap">
                    <img src={getUserAvatar(user)} alt={user} className="member-avatar" />
                    <span className="online-dot" />
                  </div>
                  <div className="member-info">
                    <span className="member-name">{user}</span>
                    {isYou ? (
                      <span className="member-you">YOU · {color.key}</span>
                    ) : (
                      <span className="member-color">
                        <i style={{ backgroundColor: color.hex }} />
                        {color.key}
                      </span>
                    )}
                  </div>
                  <span className="color-dot" style={{ backgroundColor: color.hex }} title={`${user}'s chat color`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="your-color-card">
            <div>
              <span className="your-color-label">YOUR CHAT COLOR</span>
              <strong>{myColor.key}</strong>
            </div>
            <span className="your-color-swatch" style={{ backgroundColor: myColor.hex }} />
          </div>
          <button onClick={handleLogout} className="leave-button">
            <FiLogOut />
            Leave room
          </button>
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <div className="chat-title-group">
            <div className="chat-title-icon"><FiHash /></div>
            <div>
              <h1>{roomId}</h1>
              <p><span className="header-online-dot" /> {uniqueUsers.length} online</p>
            </div>
          </div>

          <div className="header-user-chip">
            <img src={getUserAvatar(currentUser)} alt={currentUser} />
            <div>
              <strong>{currentUser}</strong>
              <span><i style={{ backgroundColor: myColor.hex }} /> your color</span>
            </div>
          </div>
        </header>

        <main ref={chatBoxRef} className="messages-area">
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-icon"><FiUsers /></div>
                <h2>Welcome to #{roomId}</h2>
                <p>This is the beginning of your conversation. Say hello!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const color = getUserColor(message.sender);
                const isMine = message.sender === currentUser;

                return (
                  <div
                    key={index}
                    className={`message-row ${isMine ? "message-row-mine" : "message-row-other"} animate-message`}
                  >
                    {!isMine && (
                      <img
                        className="message-avatar"
                        src={getUserAvatar(message.sender)}
                        alt={message.sender}
                      />
                    )}

                    <div
                      className={`message-card ${isMine ? "message-card-mine" : "message-card-other"}`}
                      style={{ "--message-color": color.hex }}
                    >
                      <div className="message-meta">
                        <span className="message-sender">{isMine ? "You" : message.sender}</span>
                        <span className="message-time">{timeAgo(message.timeStamp)}</span>
                      </div>

                      {message.messageType === "IMAGE" ? (
                        <img
                          src={`${baseURL}${message.fileUrl}`}
                          alt={message.fileName || "shared image"}
                          className="message-image"
                        />
                      ) : message.messageType === "PDF" ? (
                        <a
                          href={`${baseURL}${message.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="message-file"
                        >
                          📄 {message.fileName}
                        </a>
                      ) : (
                        <p className="message-text">{message.content}</p>
                      )}
                    </div>

                    {isMine && (
                      <img
                        className="message-avatar"
                        src={getUserAvatar(message.sender)}
                        alt={message.sender}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>

        <div className="composer-wrap">
          {selectedFile && (
            <div className="file-preview">
              {selectedFile.type.startsWith("image") ? (
                <img src={URL.createObjectURL(selectedFile)} alt="preview" />
              ) : (
                <span>📄 {selectedFile.name}</span>
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  const fileInput = document.getElementById("fileInput");
                  if (fileInput) fileInput.value = "";
                }}
              >
                ×
              </button>
            </div>
          )}

          {showEmojiPicker && (
            <div className="emoji-popover">
              <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={320} height={400} />
            </div>
          )}

          <div className="composer">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="composer-button"
              title="Emoji"
            >
              <BsEmojiSmile />
            </button>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              type="text"
              placeholder="Message the room..."
            />

            <input
              id="fileInput"
              type="file"
              accept="image/*,.pdf"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
              }}
            />

            <button
              onClick={() => document.getElementById("fileInput")?.click()}
              className="composer-button"
              title="Attach file"
            >
              <MdAttachFile />
            </button>

            <button onClick={sendMessage} className="send-button" title="Send message">
              <MdSend />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
