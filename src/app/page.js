"use client";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import socket from "@/services/socket";

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth < 640); 
    };

    checkMobileView();

    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");

    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
      fetchMessages();
      socket.emit("join", { userId: storedUserId, userName: storedUserName });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("userJoined", (data) => {
      setOnlineUsers((prev) => [...prev, data]);
    });

    socket.on("userLeft", (data) => {
      setOnlineUsers((prev) => 
        prev.filter((user) => user.userId !== data.userId)
      );
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("message");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("onlineUsers");
    };
  }, []);

  // Existing methods from the original implementation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleJoin = async () => {
    if (!userName.trim()) return alert("Please enter your name");
    const id = uuidv4();
    setUserId(id);
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", userName);

    socket.emit("join", { userId: id, userName });
    fetchMessages();
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessage = {
      userId,
      userName,
      messageBody: message,
      timeStamp: new Date().toISOString(),
    };

    socket.emit("message", newMessage);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    setMessage("");
  };

  const handleLogout = () => {
    socket.emit("left", { userId, userName });
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setUserId("");
    setUserName("");
    setMessages([]);
    setOnlineUsers([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-white flex flex-col sm:flex-row shadow-xl rounded-xl overflow-hidden relative">
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 text-gray-700 bg-white p-2 rounded-full shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className={`
          absolute sm:relative top-0 left-0 w-full sm:w-1/4 bg-white border-r border-gray-200 flex flex-col 
          h-full z-40 transform transition-transform duration-300 ease-in-out
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${!isMobile ? '' : 'fixed'}
        `}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Online Users 
              <span className="ml-2 text-sm text-gray-500">
                ({onlineUsers.length})
              </span>
            </h2>
            {userId && (
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50 p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
          <div className="h-[calc(90vh-60px)] overflow-y-auto">
            {onlineUsers.map((user) => (
              <div 
                key={user.userId} 
                className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100 flex items-center"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800">{user.userName}</span>
              </div>
            ))}
          </div>
        </div>

        {isMobile && isSidebarOpen && (
          <div 
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black opacity-50 z-30"
          />
        )}

        <div className="w-full sm:w-3/4 flex flex-col relative">
          {!userId ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="w-full max-w-md p-4 sm:p-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">🔥 Group Chat</h1>
                <input
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <button
                  onClick={handleJoin}
                  className="w-full bg-green-500 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-green-600 transition"
                >
                  Join Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#f0f2f5] p-4 border-b border-gray-200 flex items-center justify-between">
                <span className="text-lg sm:text-xl font-semibold text-gray-800">
                  Group Chat
                </span>
              </div>

              <div className="flex-grow overflow-y-auto p-2 sm:p-4 h-[70vh] overflow-scroll bg-[#f0f2f5]">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 flex ${
                      msg.userId === userId 
                        ? "justify-end" 
                        : msg.userId === "system" 
                          ? "justify-center" 
                          : "justify-start"
                    }`}
                  >
                    <div 
                      className={`max-w-[70%] p-2 rounded-lg text-sm sm:text-base ${
                        msg.userId === userId 
                          ? "bg-green-100" 
                          : msg.userId === "system" 
                            ? "bg-gray-200 italic" 
                            : "bg-white"
                      }`}
                    >
                      {msg.userId !== "system" && (
                        <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          {msg.userName}
                        </div>
                      )}
                      {msg.messageBody}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white p-2 sm:p-4 border-t border-gray-200 sticky bottom-0">

                <div className="flex space-x-2">
                  <input
                    className="flex-grow p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-green-600 text-sm sm:text-base"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}