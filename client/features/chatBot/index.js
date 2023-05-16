import React, { useState, useEffect, useRef } from "react";

import "./chatBot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const prepareMessagesForAPI = (messages) => {
    return messages.map(({ id, ...rest }) => rest);
  };

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const oldMessages = [...messages];

    // const userMessage = { role: "user", content: newMessage };
    // oldMessages.push(userMessage);
    // setMessages(oldMessages);
    // setNewMessage("");

    // const aiMessage = {
    //   role: "assistant",
    //   content: "AI thinking...",
    //   id: generateUniqueId(),
    // };

    // oldMessages.push(aiMessage);
    // console.log(oldMessages);

    const userMessage = {
      id: generateUniqueId(),
      role: "user",
      content: newMessage,
    };
    const aiMessage = {
      id: generateUniqueId(),
      role: "assistant",
      content: "AI thinking...",
    };

    setMessages((oldMessages) => [...oldMessages, userMessage, aiMessage]);
    setNewMessage("");

    const messagesForAPI = prepareMessagesForAPI([
      ...messages,
      userMessage,
      aiMessage,
    ]);

    const loadingDots = setInterval(() => {
      setMessages((currentMessages) => {
        return currentMessages.map((message) => {
          if (message.id === aiMessage.id) {
            if (message.content.endsWith("...")) {
              return { ...message, content: "AI thinking." };
            } else if (message.content.endsWith("..")) {
              return { ...message, content: "AI thinking..." };
            } else if (message.content.endsWith(".")) {
              return { ...message, content: "AI thinking.." };
            }
          }
          return message;
        });
      });
    }, 500);

    try {
      const response = await fetch("http://localhost:8080/openAi/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForAPI,
        }),
      });

      clearInterval(loadingDots);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const parsedData = data.assistant;
        console.log(parsedData);

        if (parsedData) {
          let index = 0;
          const interval = setInterval(() => {
            if (index < parsedData.length) {
              setMessages((currentMessages) => {
                const updatedMessages = currentMessages.map((message) =>
                  message.id === aiMessage.id
                    ? {
                        ...message,
                        content:
                          index === 0
                            ? parsedData[index]
                            : message.content + parsedData[index],
                      }
                    : message
                );
                console.log(updatedMessages);
                return updatedMessages;
              });
              index++;
            } else {
              clearInterval(interval);
            }
          }, 20);
        }
      } else {
        throw new Error(await response.text());
      }
    } catch (err) {
      alert(err);
    }
  };

  if (!showChat) {
    return (
      <div>
        <img
          onClick={() => setShowChat(true)}
          src="/aiChatRB.png"
          alt="your AI chat assistant "
          className="w-20 h-20"
        ></img>
      </div>
    );
  }

  return (
    <div className="chatBotContainer">
      <div>
        <div id="chat_container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div
              className={`wrapper ${message.role === "assistant" ? "ai" : ""}`}
              key={index}
            >
              <div className="chat">
                <div className="profile">
                  <img
                    src={
                      message.role === "assistant" ? "/bot.svg" : "/user.svg"
                    }
                    alt={message.role === "assistant" ? "bot" : "user"}
                  ></img>
                </div>
                {console.log(message.content)}
                <div className="message">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chatArea">
          <form onSubmit={handleSubmit}>
            <textarea
              name="prompt"
              rows="1"
              cols="1"
              placeholder="Ask AI Chatbot"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            ></textarea>
            <button type="submit">
              <img src="/send.svg" />
            </button>
          </form>
          <img
            onClick={() => setShowChat(false)}
            src="/aiChatRB.png"
            alt="your AI chat assistant "
            className="w-20 h-20"
          ></img>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
