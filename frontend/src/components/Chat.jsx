import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Connection to the Back-End
const socket = io("http://localhost:5000");

const Chat = () => {
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (message.trim() && sender.trim()) {
      const msg = { content: message, sender };
      socket.emit("sendMessage", msg);
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.content} <em>({msg.timestamp})</em>
          </p>
        ))}
      </div>
      <input
        type="text"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        placeholder="Enter your name..."
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
