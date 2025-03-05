"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import socket from "@/services/socket";

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");

    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("message");
  }, []);

  const fetchMessages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
    const data = await res.json();
    setMessages(data.data);
  };

  const handleJoin = () => {
    if (!userName.trim()) return;
    const id = uuidv4();
    setUserId(id);
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", userName);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      userId,
      userName,
      messageBody: message,
      timeStamp: new Date().toISOString(),
    };
    socket.emit("message", newMessage);
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setUserId("");
    setUserName("");
  };

  return (
    <div>
      {!userId ? (
        <>
          <input placeholder="Enter Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <button onClick={handleJoin}>Join Chat</button>
        </>
      ) : (
        <>
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.userName}</strong>: {msg.messageBody}
            </div>
          ))}
          <input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}
