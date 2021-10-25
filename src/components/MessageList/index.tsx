import React, { useEffect, useState } from "react";

import { ScrollView } from "react-native";
import { api } from "../../services/api";
import { Message, MessageProps } from "../Message";
import { io } from "socket.io-client";

import { MESSAGES_EXAMPLE } from "../../utils/messages";

import { styles } from "./styles";

let messagesQueue: MessageProps[] = MESSAGES_EXAMPLE;

const socket = io(String(api.defaults.baseURL));
socket.on("new_message", (newMessage) => {
  console.log("message: ", newMessage);
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      const messageResponse = await api.get<MessageProps[]>("/messages/last3");
      setMessages(messageResponse.data);
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((prevState) => [
          messagesQueue[0],
          prevState[0],
          prevState[1],
        ]);

        messagesQueue.shift();
      }
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {messages.map((message) => {
        return <Message key={message.id} data={message} />;
      })}
    </ScrollView>
  );
}
