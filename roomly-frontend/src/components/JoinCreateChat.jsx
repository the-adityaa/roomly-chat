import React, { useState } from "react";
import toast from "react-hot-toast";
import { CgLogIn } from "react-icons/cg";
import { FiArrowRight, FiHash, FiUser, FiUsers } from "react-icons/fi";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router-dom";
import chatIcon from "../assets/chat.png";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });
  const [loading, setLoading] = useState("");

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    const userName = detail.userName.trim();
    const roomId = detail.roomId.trim();

    if (!userName || !roomId) {
      toast.error("Please enter your name and room ID");
      return false;
    }

    if (userName.length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }

    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;

    setLoading("join");
    try {
      const room = await joinChatApi(detail.roomId.trim());
      toast.success("Joined room");
      setCurrentUser(detail.userName.trim());
      setRoomId(room.roomId);
      setConnected(true);

      localStorage.setItem("roomly_user", detail.userName.trim());
      localStorage.setItem("roomly_room", room.roomId);

      navigate("/chat");
    } catch (error) {
      if (error.status === 400) {
        toast.error(error.response?.data || "Room not found");
      } else {
        toast.error("Could not join the room");
      }
      console.error(error);
    } finally {
      setLoading("");
    }
  }

  async function createRoom() {
    if (!validateForm()) return;

    setLoading("create");
    try {
      const response = await createRoomApi({
        roomId: detail.roomId.trim(),
      });

      toast.success("Room created");
      setCurrentUser(detail.userName.trim());
      setRoomId(response.roomId);
      setConnected(true);

      localStorage.setItem("roomly_user", detail.userName.trim());
      localStorage.setItem("roomly_room", room.roomId);

      navigate("/chat");
    } catch (error) {
      if (error.status === 400) {
        toast.error("Room already exists");
      } else {
        toast.error("Could not create the room");
      }
      console.error(error);
    } finally {
      setLoading("");
    }
  }

  return (
    <main className="join-page">
      <div className="join-glow join-glow-one" />
      <div className="join-glow join-glow-two" />

      <section className="join-card">
        <div className="brand-mark">
          <img src={chatIcon} alt="Roomly" />
        </div>

        <div className="brand-name">Roomly</div>
        <h1>Join or create a room</h1>
        <p className="join-subtitle">
          Start a private conversation with your people.
        </p>

        <div className="room-features">
          <span><FiUsers /> Real-time</span>
          <span><FiHash /> Room based</span>
        </div>

        <div className="join-form">
          <div className="field">
            <label htmlFor="userName">Your name</label>
            <div className="input-wrap">
              <FiUser className="input-icon" />
              <input
                onChange={handleFormInputChange}
                value={detail.userName}
                type="text"
                id="userName"
                name="userName"
                placeholder="Enter your name"
                autoComplete="name"
                maxLength={30}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="roomId">Room ID</label>
            <div className="input-wrap">
              <FiHash className="input-icon" />
              <input
                name="roomId"
                onChange={handleFormInputChange}
                value={detail.roomId}
                placeholder="e.g. friends-room"
                type="text"
                id="roomId"
                autoComplete="off"
                maxLength={50}
              />
            </div>
            <span className="field-hint">
              Use an existing ID to join, or a new ID to create a room.
            </span>
          </div>

          <div className="join-actions">
            <button
              type="button"
              onClick={joinChat}
              disabled={Boolean(loading)}
              className="btn btn-primary"
            >
              <CgLogIn />
              {loading === "join" ? "Joining..." : "Join room"}
              {loading !== "join" && <FiArrowRight />}
            </button>

            <button
              type="button"
              onClick={createRoom}
              disabled={Boolean(loading)}
              className="btn btn-secondary"
            >
              {loading === "create" ? "Creating..." : "Create room"}
            </button>
          </div>
        </div>

        <div className="join-footer">
          <span className="status-dot" />
          <span>Ready for real-time chat</span>
        </div>
      </section>
    </main>
  );
};

export default JoinCreateChat;
