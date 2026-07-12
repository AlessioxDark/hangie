import { useChat } from "@/contexts/ChatContext.js";
import { useAuth } from "@/contexts/AuthContext.js";
import ChatInput from "@/features/chats/ChatInput.js";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/SocketContext.js";
import ChatsEvents from "@/features/chats/ChatsEvents.js";
import ChatHeader from "@/features/chats/ChatHeader.js";
import ChatView from "@/features/chats/ChatView.js";
import RenderEmptyState from "@/features/utils/RenderEmptyState";
import { useParams } from "react-router";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
const Chats = () => {
  const {
    currentGroupData,
    setCurrentChatData,
    setGroupsData,
    currentChatData,
    currentGroup,
    setCurrentGroup,
  } = useChat();
  const { currentSocket } = useSocket();
  const [chatInput, setChatInput] = useState<string>("");
  const chatInputRef = useRef<HTMLInputElement>(null);
  const { session, isAuthLoading } = useAuth();

  const sendMessage = async () => {
    if (!currentSocket) {
      console.error("Socket non ancora connesso!");
      return;
    }
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) return;

    // Generiamo un ID temporaneo locale per evitare duplicati nella chiave React
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const optimisticMessage = {
      message_id: tempMessageId,
      content: trimmedInput,
      group_id: currentGroupData.group_id,
      user_id: session.user.id,
      sent_at: Date.now(),
      isUser: true,
      isSent: false, // Mostra l'icona di caricamento (ancora non arrivato al server)
      isRead: false,
      utenti: {
        user_id: session.user.id,
        // Passa qui l'avatar dell'utente corrente memorizzato nella sessione
        profile_pic: session.user.user_metadata?.profile_pic || null,
      },
      isOptimistic: true, // Flag utile per gestire la grafica
    };

    setCurrentChatData((prevData) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        messaggi: [...prevData.messaggi, optimisticMessage],
      };
    });

    // ── 2. AGGIORNA SUBITO L'ANTEPRIMA NELLA SIDEBAR (Istantaneo) ──
    setGroupsData((prev) =>
      prev.map((g) =>
        String(g.group_id) === String(currentGroupData.group_id)
          ? {
              ...g,
              ultimoMessaggio: optimisticMessage,
              updated_at: new Date().toISOString(),
            }
          : g,
      ),
    );

    // ── 3. INVIA AL SERVER PASSANDO ANCHE L'ID TEMPORANEO ──
    currentSocket.emit(
      "send_message",
      trimmedInput,
      currentGroupData.group_id,
      session.access_token,
      {
        group_cover_img: currentGroupData.group_cover_img,
        nome: currentGroupData.nome,
        tempMessageId, // <-- CRITICO: invialo al backend per la riconciliazione
      },
    );

    setChatInput("");
    if (chatInputRef.current) chatInputRef.current.textContent = "";
  };

  const messaggi = currentChatData?.messaggi;

  // 1. ── FIX EFFECT SPUNTE BLU (Evita Loop Infiniti) ──
  useEffect(() => {
    if (!messaggi || !currentSocket || !currentGroup) return;

    // Filtra i messaggi non letti scritti dagli altri
    const messaggiDaLeggere = messaggi
      .filter((m) => !m.isRead && m.user_id !== session?.user?.id)
      .map((m) => m.message_id);

    if (messaggiDaLeggere.length > 0) {
      currentSocket.emit(
        "message_read_bulk",
        messaggiDaLeggere,
        session.user.id,
        currentGroup,
      );
    }
    // Monitoriamo SOLO la lunghezza. Se cambia lo stato interno di un messaggio (es. isSent o isRead),
    // la lunghezza resta uguale e l'effetto NON si riattiva a vuoto.
  }, [messaggi?.length, currentSocket, session?.user?.id, currentGroup]);

  if (isAuthLoading) {
    return <RenderLoadingState type={"chat"} />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ChatHeader />

      <ChatView messaggi={messaggi} />
      <ChatInput
        chatInputRef={chatInputRef}
        sendMessage={sendMessage}
        inputValue={chatInput}
        setInputValue={setChatInput}
      />
    </div>
  );
};

export default Chats;
