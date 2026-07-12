import MessageCard from "@/components/messaggi/MessageCard";
import MessageEvent from "./MessageEvent";
import React, { useEffect, useRef } from "react";
const ChatView = ({ messaggi }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const scrollBehavior = messaggi?.length <= 20 ? "instant" : "smooth";
    messagesEndRef.current?.scrollIntoView({ behavior: scrollBehavior });
  });

  return (
    <div className="flex-1 overflow-y-auto relative w-full bg-bg-1">
      {/* Contenitore Bolle dei Messaggi */}
      <div className="flex flex-col gap-2 mt-4 px-3 pb-6 w-full">
        {messaggi?.map((mess) => {
          const isUserMessage = mess.isUser;

          return (
            <div
              key={mess.message_id || mess.id}
              className={`w-full flex ${isUserMessage ? "justify-end" : "justify-start"}`}
            >
              {mess.type === "event" ? (
                <MessageEvent {...mess} />
              ) : (
                <MessageCard {...mess} />
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    </div>
  );
};

export default ChatView;
