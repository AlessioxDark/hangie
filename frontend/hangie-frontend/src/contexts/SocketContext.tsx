import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { type GroupData } from "@/types/chat";
import { useLocation, useNavigate } from "react-router";
import { useFriends } from "./FriendsContext";
import { useScreen } from "./ScreenContext";
import { useApi } from "./ApiContext";

const SocketContext = createContext({
  currentSocket: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error(
      "useSocket deve essere usato all'interno di un ChatProvider",
    );
  }

  return context;
};

export const SocketProvider = ({ children }) => {
  const [currentSocket, setCurrentSocket] = useState(null); // Usiamo lo stato invece di useRef per la disponibilità
  const {
    setCurrentChatData,
    currentGroup,
    currentGroupData,
    setGroupsData,

    setCurrentGroup,
    setCurrentGroupData,
    setMessagesMap,
    setGroupEventsData,
    setHomeEventsData,
    currentEventData,
    messagesMap,
    groupEventsData,
    setCurrentEventData,
  } = useChat();
  const { setError } = useApi();
  const { session } = useAuth();
  const { currentScreen } = useScreen();
  const { getFriendsData } = useFriends();
  const currentGroupDataRef = useRef<null | GroupData>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath =
    location.state?.backgroundLocation?.pathname || location.pathname;
  useEffect(() => {
    currentGroupDataRef.current = currentGroupData;
  }, [currentGroupData]);

  // const SERVER_URL = "https://hangie-web.onrender.com/";
  const SERVER_URL = "http://localhost:3000/";
  useEffect(() => {
    if (!session?.user?.id || currentScreen !== "xs") {
      return;
    }

    const socket = io(SERVER_URL, {
      transports: ["websocket"], // 🚀 Forza l'uso del WebSocket puro, disattiva il polling HTTP
      upgrade: false, // Evita tentativi di upgrade intermedi
      autoConnect: true,
    });
    socket.on("connect", () => {
      socket.emit("identify_user", session.user.id);
      setCurrentSocket(socket);
    });
    socket.on("receive_message", (data) => {
      const isMe = data.sender_id === session?.user?.id;
      const targetGroupId = String(data.group_id);

      const finalMessage = {
        message_id: data.message_id, // L'ID definitivo di Supabase
        content: data.message,
        group_id: data.group_id,
        user_id: data.sender_id,
        sent_at: Date.now(),
        isUser: isMe,
        isSent: false,
        isRead: false,
        utenti: data.sender,
        isOptimistic: false,
        local_id: null, // Puliamo il local_id perché ormai è sul DB
      };

      // 1. Sidebar dei gruppi
      setGroupsData((prev) => {
        const messageToUpdate = prev.find(
          (g) => String(g.group_id) === String(targetGroupId),
        );
        const filteredGroups = prev.filter((g) => g.group_id !== targetGroupId);
        if (!messageToUpdate) return prev;
        messageToUpdate.ultimoMessaggio = finalMessage;
        messageToUpdate.updated_at = new Date().toISOString();
        return [messageToUpdate, ...filteredGroups];
      });

      // 2. Chat attiva corrente
      if (String(currentGroup) === targetGroupId) {
        console.log("sono io, ho il local_id e", isMe, data.local_id);
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;

          // Se il messaggio l'ho inviato io, cerco per local_id per piallare la versione ottimistica
          if (isMe && data.local_id) {
            const localExists = prevData.messaggi.some(
              (m) => m.local_id === data.local_id,
            );
            console.log("sono io, ho il local_id e", localExists);

            if (localExists) {
              return {
                ...prevData,
                messaggi: prevData.messaggi.map((m) =>
                  m.local_id === data.local_id ? finalMessage : m,
                ),
              };
            }
          }

          // Se non è mio (o se per qualche motivo il local_id non è passato), controllo il classico anti-duplicato per message_id
          if (prevData.messaggi.some((m) => m.message_id === data.message_id)) {
            return prevData;
          }

          return {
            ...prevData,
            messaggi: [...prevData.messaggi, finalMessage],
          };
        });
      }

      // 3. Mappa globale dei messaggi (Stessa identica logica di riconciliazione)
      setMessagesMap((messMap) => {
        const groupMessages = messMap[data.group_id] || [];

        if (isMe && data.local_id) {
          const localExists = groupMessages.some(
            (m) => m.local_id === data.local_id,
          );
          if (localExists) {
            return {
              ...messMap,
              [data.group_id]: groupMessages.map((m) =>
                m.local_id === data.local_id ? finalMessage : m,
              ),
            };
          }
        }

        if (groupMessages.some((m) => m.message_id === data.message_id)) {
          return messMap;
        }

        return {
          ...messMap,
          [data.group_id]: [...groupMessages, finalMessage],
        };
      });

      if (!isMe) {
        socket.emit(
          "message_sent",
          data.message_id,
          session?.user?.id,
          data.group_id,
        );
      }
    });

    // 3. ── ASCOLTO CONFERMA RICEZIONE (Doppia spunta) ──
    socket.on("message_arrived", (data) => {
      const targetGroupId = String(data.group_id);

      // 1. Aggiorna la mappa globale
      setMessagesMap((messMap) => {
        const groupMessages = messMap[data.group_id] || [];

        // Creiamo una mappa univoca per ID: impedisce i duplicati alla radice
        const messageMap = new Map(groupMessages.map((m) => [m.message_id, m]));

        if (messageMap.has(data.message_id)) {
          const existing = messageMap.get(data.message_id);
          messageMap.set(data.message_id, { ...existing, isSent: true });
        } else {
          // Se l'evento del socket è più veloce di React, prepariamo già il record corretto
          messageMap.set(data.message_id, {
            message_id: data.message_id,
            isSent: true,
          });
        }

        return {
          ...messMap,
          [data.group_id]: Array.from(messageMap.values()),
        };
      });

      // 2. Aggiorna la chat corrente
      if (String(currentGroup) === targetGroupId) {
        setCurrentChatData((prevData) => {
          if (!prevData || !prevData.messaggi) return prevData;

          // 🚀 BLINDATURA: Usiamo la Map ed eliminiamo il vecchio controllo "if (!hasUnsentTarget)"
          const messageMap = new Map(
            prevData.messaggi.map((m) => [m.message_id, m]),
          );

          if (messageMap.has(data.message_id)) {
            const existing = messageMap.get(data.message_id);
            messageMap.set(data.message_id, { ...existing, isSent: true });
          } else {
            // Se React non ha ancora renderizzato il messaggio ottimistico di sendMessage,
            // creiamo un segnaposto temporaneo che verrà fuso un millisecondo dopo
            messageMap.set(data.message_id, {
              message_id: data.message_id,
              isSent: true,
            });
          }

          return {
            ...prevData,
            messaggi: Array.from(messageMap.values()),
          };
        });
      }
    });
    socket.on("added_new_group", (groupId, data, participants, imgUrl) => {
      setGroupsData((prev) => {
        return [
          {
            group_id: groupId,
            group_cover_img: imgUrl,
            ...data,
            partecipanti_gruppo: participants,
            ultimoMessaggio: { sent_at: Date.now(), content: "" },
          },
          ...prev,
        ];
      });
    });

    socket.on("left_group", (groupId, userId) => {
      const isMe = session.user.id == userId;
      if (isMe) {
        setGroupsData((prev) => prev.filter((g) => g.group_id !== groupId));

        // 🚀 3. Rimuoviamo gli eventi della home legati a quel gruppo
        setHomeEventsData((prevEvents) => ({
          pending: prevEvents.pending.filter((e) => e.group_id !== groupId),
          accepted: prevEvents.accepted.filter((e) => e.group_id !== groupId),
          rejected: prevEvents.rejected.filter((e) => e.group_id !== groupId),
        }));
        if (currentGroup == groupId) {
          navigate("/chats");
          setCurrentGroup(null);
        }
        return;
      }

      // 👥 SE È UN ALTRO UTENTE (Gli altri rimasti nel gruppo):
      // Loro devono aggiornare la UI in tempo reale perché non sanno che sei uscito!
      setGroupsData((prev) => {
        return prev.map((group) => {
          if (group.group_id === groupId) {
            const newParticipants = group.partecipanti_gruppo.filter(
              (p) =>
                (p.partecipante_id || p.user_id || p.utenti?.user_id) !==
                userId,
            );
            return { ...group, partecipanti_gruppo: newParticipants };
          }
          return group;
        });
      });

      if (currentGroup && currentGroup == groupId) {
        setCurrentGroupData((prev) => {
          if (!prev) return prev;
          const newParticipants = prev.partecipanti_gruppo.filter(
            (p) =>
              (p.partecipante_id || p.user_id || p.utenti?.user_id) !== userId,
          );
          return { ...prev, partecipanti_gruppo: newParticipants };
        });

        setCurrentChatData((prevChat) => {
          if (!prevChat || !prevChat.messaggi) return prevChat;
          const newMessaggi = prevChat.messaggi.map((m) => {
            if (m.type == "event" && m.event_details?.risposte_evento) {
              const newRisposte = m.event_details.risposte_evento.filter(
                (r) =>
                  (r.utenti?.user_id || r.user_id || r.utente?.user_id) !==
                  userId,
              );
              return {
                ...m,
                event_details: {
                  ...m.event_details,
                  risposte_evento: newRisposte,
                },
              };
            }
            return m;
          });
          return { ...prevChat, messaggi: newMessaggi };
        });
      }
    });
    socket.on("added_participants", (data) => {
      setGroupsData((prev) => {
        const groupExists = prev.find((g) => g.group_id === data.group_id);
        // Usiamo MAP per creare un nuovo array, non forEach
        if (groupExists) {
          return prev.map((group) => {
            if (group.group_id === data.group_id) {
              return {
                ...group,
                partecipanti_gruppo: data.newParticipants,
              };
            }
            return group;
          });
        } else {
          return [data.groupInfo, ...prev];
        }
      });
      if (currentGroup && currentGroupData?.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            partecipanti_gruppo: data.newParticipants,
          };
        });
        // MANCA CARICAMENTO DA ROUTE DI CURRENTCHATDATA E POI TESTIAMO TUTTO
        setCurrentChatData((prev) => {
          if (!prev || !prev.messaggi) return prev;
          const newMessaggi = prev.messaggi.map((m) => {
            if (m.type == "event") {
              const newRisposte = [
                ...m.event_details.risposte_evento,
                ...(data.eventsResponses?.[m.event_id] || []),
              ];
              return {
                ...m,
                event_details: {
                  ...m.event_details,
                  risposte_evento: newRisposte,
                },
              };
            }
            return m;
          });
          return { ...prev, messaggi: newMessaggi };
        });
      }

      if (data.eventsDetails) {
        // "L'OPPOSTO" DEL REDUCE: Trasformiamo l'oggetto in un array piatto
        const flatEvents = Object.values(data.eventsDetails).flat();

        setHomeEventsData((prevData) => {
          // Evitiamo duplicati: filtriamo gli eventi che sono già presenti in qualche categoria
          const existingIds = new Set([
            ...prevData.accepted.map((e) => e.event_id),
            ...prevData.pending.map((e) => e.event_id),
          ]);

          const newPendingEvents = flatEvents.filter(
            (e) => !existingIds.has(e.event_id),
          );

          return {
            ...prevData,
            pending: [...newPendingEvents, ...prevData.pending],
          };
        });
      }
    });

    socket.on("edited_field", (data) => {
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            return {
              ...group,
              [data.field]: data.fieldValue,
            };
          }
          return group;
        });
      });
      if (currentGroupData?.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            [data.field]: data.fieldValue,
          };
        });
      }
    });
    socket.on("admined_participant", (data) => {
      setGroupsData((prev) => {
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            const nuoviPartecipantiGruppo = group.partecipanti_gruppo.map(
              (p) => {
                const isTarget =
                  (p.partecipante_id || p.user_id || p.utenti?.user_id) ==
                  (data.participant.partecipante_id ||
                    data.participant.user_id);
                return isTarget ? { ...p, role: "admin" } : p;
              },
            );
            return {
              ...group,
              partecipanti_gruppo: nuoviPartecipantiGruppo,
            };
          }
          return group;
        });
      });

      if (currentGroupData?.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          if (!prev || !prev.partecipanti_gruppo) return prev;
          const nuoviPartecipantiGruppo = prev.partecipanti_gruppo.map((p) => {
            const isTarget =
              (p.partecipante_id || p.user_id || p.utenti?.user_id) ==
              (data.participant.partecipante_id || data.participant.user_id);
            return isTarget ? { ...p, role: "admin" } : p;
          });
          return {
            ...prev,
            partecipanti_gruppo: nuoviPartecipantiGruppo,
          };
        });
      }
    });
    socket.on("sent_event", (data) => {
      const myStatus =
        data.eventi.created_by == session.user.id ? "accepted" : "pending";
      const eventMessage = {
        type: "event",
        message_id: data.messageDetails.message_id,
        event_details: { ...data.eventi, status: myStatus },
        isUser: session.user.id == data.messageDetails.user_id,
        group_id: data.group_id,
        event_id: data.eventi.event_id,
      };
      if (currentGroup == data.group_id) {
        setCurrentChatData((prev) => {
          if (!prev || !prev.messaggi) return prev;
          return { ...prev, messaggi: [...prev.messaggi, eventMessage] };
        });
        setGroupEventsData((prevGroups) => [
          ...(prevGroups || []),
          eventMessage.event_details,
        ]);
      }
      if (messagesMap[data.group_id]) {
        setMessagesMap((messMap) => {
          return {
            ...messMap,
            [data.group_id]: [...messMap[data.group_id], eventMessage],
          };
        });
      }

      if (eventMessage.isUser) {
        setHomeEventsData((prevEvents) => {
          const category = eventMessage.isUser ? "accepted" : "pending";
          return {
            ...prevEvents,
            [category]: [
              { ...data.eventi, status: myStatus },
              ...prevEvents[category],
            ],
          };
        });
      } else {
        setHomeEventsData((prevEvents) => {
          return {
            ...prevEvents,
            pending: [
              { ...data.eventi, status: myStatus },
              ...prevEvents.pending,
            ],
          };
        });
      }

      setGroupsData((prev) => {
        const messageToUpdate = prev.find(
          (g) => String(g.group_id) === String(data.group_id),
        );
        const filteredGroups = prev.filter((g) => g.group_id !== data.group_id);
        if (!messageToUpdate) return prev;
        const updatedGroup = {
          ...messageToUpdate,
          ultimoMessaggio: {
            type: "event",
            content: data.eventi.titolo,
            sent_at: Date.now(),
          },
          updated_at: new Date().toISOString(),
        };
        return [updatedGroup, ...filteredGroups];
      });
    });
    socket.on("give_read_bulk", (data) => {
      // notifica

      setMessagesMap((messMap) => {
        return {
          ...messMap,
          [data.group_id]: messMap[data.group_id]?.map((mess) => {
            return data.message_ids.includes(mess.message_id)
              ? { ...mess, isRead: true }
              : mess;
          }),
        };
      });
      if (currentGroup == data.group_id) {
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            messaggi: prevData.messaggi.map((m) =>
              data.message_ids.includes(m.message_id)
                ? { ...m, isRead: true }
                : m,
            ),
          };
        });
      }
    });
    socket.on("removed_participant", (data) => {
      const isMe = session.user.id == data.participant.user_id;
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach

        if (!isMe) {
          return prev.map((group) => {
            if (group.group_id === data.group_id) {
              const newParticipants = group.partecipanti_gruppo.filter(
                (p) =>
                  (p.partecipante_id || p.user_id || p.utenti?.user_id) !==
                  data.participant.user_id,
              );
              return { ...group, partecipanti_gruppo: newParticipants };
            }
            return group;
          });
        } else {
          return prev.filter((g) => {
            return g.group_id !== data.group_id;
          });
        }
      });
      if (currentGroup && currentGroup == data.group_id) {
        if (isMe) {
          navigate("/chats");
          setCurrentGroup(null);
          return;
        }
        setCurrentGroupData((prev) => {
          if (!prev || !prev.partecipanti_gruppo) return prev;
          const newParticipants = prev.partecipanti_gruppo.filter(
            (p) =>
              (p.partecipante_id || p.user_id || p.utenti?.user_id) !==
              data.participant.user_id, // Verifica se la chiave è user_id o partecipante_id
          );

          return { ...prev, partecipanti_gruppo: newParticipants };
        });
        if (!isMe) {
          setCurrentChatData((prevChat) => {
            if (!prevChat || !prevChat.messaggi) return prevChat;
            const newMessaggi = prevChat.messaggi.map((m) => {
              if (m.type == "event" && m.event_details?.risposte_evento) {
                const newRisposte = m.event_details.risposte_evento.filter(
                  (r) =>
                    (r.utenti?.user_id || r.user_id || r.utente?.user_id) !==
                    data.participant.user_id,
                );
                return {
                  ...m,
                  event_details: {
                    ...m.event_details,
                    risposte_evento: newRisposte,
                  },
                };
              }
              return m;
            });
            return { ...prevChat, messaggi: newMessaggi };
          });
        }
      }

      if (isMe) {
        setHomeEventsData((prevEvents) => {
          return {
            pending: prevEvents.pending.filter(
              (e) => e.group_id !== data.group_id,
            ),
            accepted: prevEvents.accepted.filter(
              (e) => e.group_id !== data.group_id,
            ),
            rejected: prevEvents.rejected.filter(
              (e) => e.group_id !== data.group_id,
            ),
          };
        });
      }
    });
    socket.on("deleted_event", (data) => {
      const { event_id, group_id } = data;

      if (currentPath == `/events/${event_id}`) {
        navigate(-1);
      }
      setMessagesMap((messMap) => {
        const groupMessages = messMap[group_id];
        if (!groupMessages) return messMap;
        return {
          ...messMap,
          [group_id]: groupMessages.filter((m) => {
            if (m.type === "event") {
              return m.event_details?.event_id !== event_id;
            }
            return m.event_id !== event_id;
          }),
        };
      });

      setHomeEventsData((prevEvents) => {
        return {
          ...prevEvents,
          pending: prevEvents.pending.filter((e) => e.event_id !== event_id),
          accepted: prevEvents.accepted.filter((e) => e.event_id !== event_id),
        };
      });
      if (currentGroup == group_id) {
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;

          return {
            ...prevData,
            messaggi: prevData.messaggi.filter((m) => {
              if (m?.event_id == null && m?.event_details?.event_id == null)
                return true;
              return (m.event_details?.event_id || m.event_id) !== event_id;
            }),
          };
        });

        setGroupEventsData((prevEvents) => {
          if (!prevEvents) return null;
          return prevEvents.filter((e) => e.event_id !== event_id);
        });
      }
    });
    socket.on("voted_event", (data) => {
      const { event_id, group_id, status, sender_id, profile_pic } = data;
      const isMe = sender_id === session.user.id;

      // 1. CHAT MESSAGES: Ottimizzazione con uscita anticipata
      setCurrentChatData((prevData) => {
        if (!prevData?.messaggi) return prevData;

        // Controlliamo prima se esiste almeno un messaggio di tipo event correlato
        const hasEventMessage = prevData.messaggi.some(
          (m) => m.type === "event" && m.event_id === event_id,
        );
        if (!hasEventMessage) return prevData; // Se non c'è, risparmiamo un .map completo su tutta la chat

        return {
          ...prevData,
          messaggi: prevData.messaggi.map((m) => {
            if (m.type !== "event" || m.event_id !== event_id) return m;

            return {
              ...m,
              event_details: {
                ...m.event_details,
                status: isMe ? status : m.event_details.status,
                risposte_evento: m.event_details.risposte_evento.map((r) =>
                  r.utenti?.user_id === sender_id
                    ? { ...r, status, utenti: { ...r.utenti, profile_pic } }
                    : r,
                ),
              },
            };
          }),
        };
      });

      // 2. DETTAGLIO EVENTO CORRENTE: Esegui solo se la pagina dell'evento specifico è aperta
      if (currentEventData?.event_id === event_id) {
        setCurrentEventData((prev) => {
          if (!prev) return prev;
          const exists = prev.risposte_evento.some(
            (r) => r.utenti?.user_id === sender_id,
          );
          return {
            ...prev,
            status: isMe ? status : prev.status,
            risposte_evento: exists
              ? prev.risposte_evento.map((r) =>
                  r.utenti?.user_id === sender_id
                    ? { ...r, status, utenti: { ...r.utenti, profile_pic } }
                    : r,
                )
              : [
                  ...prev.risposte_evento,
                  {
                    status,
                    user_id: sender_id,
                    utenti: { user_id: sender_id, profile_pic },
                  },
                ],
          };
        });
      }

      // 3. HOME EVENTS
      setHomeEventsData((prevEvents) => {
        let currentCategory = null;

        // Ricerca della categoria senza fare Object.keys ad ogni render
        if (prevEvents.pending.some((e) => e.event_id === event_id))
          currentCategory = "pending";
        else if (prevEvents.accepted.some((e) => e.event_id === event_id))
          currentCategory = "accepted";
        else if (prevEvents.rejected.some((e) => e.event_id === event_id))
          currentCategory = "rejected";

        if (!currentCategory) return prevEvents;

        const eventToUpdate = prevEvents[currentCategory].find(
          (e) => e.event_id === event_id,
        );
        if (!eventToUpdate) return prevEvents;

        const updatedEvent = {
          ...eventToUpdate,
          status: isMe ? status : eventToUpdate.status,
          risposte_evento: eventToUpdate.risposte_evento.map((r) =>
            r.utenti?.user_id === sender_id
              ? { ...r, status, utenti: { ...r.utenti, profile_pic } }
              : r,
          ),
        };

        if (isMe && currentCategory !== status) {
          return {
            ...prevEvents,
            [currentCategory]: prevEvents[currentCategory].filter(
              (e) => e.event_id !== event_id,
            ),
            [status]: [
              updatedEvent,
              ...prevEvents[status].filter((e) => e.event_id !== event_id),
            ],
          };
        }

        return {
          ...prevEvents,
          [currentCategory]: prevEvents[currentCategory].map((e) =>
            e.event_id === event_id ? updatedEvent : e,
          ),
        };
      });

      // 4. GROUP EVENTS
      if (currentGroup === group_id) {
        setGroupEventsData((prevEvents) => {
          if (!prevEvents) return null;
          // Aggiorna solo se l'evento appartiene a questa lista
          if (!prevEvents.some((e) => e.event_id === event_id))
            return prevEvents;

          return prevEvents.map((e) => {
            if (e.event_id !== event_id) return e;
            return {
              ...e,
              status: isMe ? status : e.status,
              risposte_evento: e.risposte_evento.map((r) =>
                r.utenti?.user_id === sender_id || r.user_id === sender_id
                  ? { ...r, status, utenti: { ...r.utenti, profile_pic } }
                  : r,
              ),
            };
          });
        });
      }

      // 5. CACHE MAPPA GLOBALE DEI MESSAGGI (messagesMap)
      if (messagesMap[group_id]) {
        setMessagesMap((messMap) => {
          const groupMessages = messMap[group_id];
          if (!groupMessages) return messMap;
          return {
            ...messMap,
            [group_id]: groupMessages.map((m) => {
              if (m.type !== "event" || m.event_id !== event_id) return m;

              return {
                ...m,
                event_details: {
                  ...m.event_details,
                  status: isMe ? status : m.event_details.status,
                  risposte_evento: m.event_details.risposte_evento.map((r) =>
                    r.utenti?.user_id === sender_id
                      ? { ...r, status, utenti: { ...r.utenti, profile_pic } }
                      : r,
                  ),
                },
              };
            }),
          };
        });
      }
    });
    socket.on("sent_request", (data) => {
      // notifica

      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("deleted_friend", (data) => {
      // notifica

      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("accepted_request", (data) => {
      // notifica

      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("rejected_request", (data) => {
      // notifica

      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("operation_failed", (data) => {
      switch (data.type) {
        case "all":
          setError("home", data.message);
          break;
        default:
          setError(data.type, data.message);
          break;
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_arrived");
      socket.off("added_new_group");
      socket.off("edited_field");
      socket.off("left_group");
      socket.off("added_participants");
      socket.off("removed_participant");
      socket.off("admined_participant");
      socket.off("give_read_bulk");
      socket.off("sent_event");
      socket.off("deleted_event");
      socket.off("voted_event");
      socket.off("sent_request");
      socket.off("deleted_friend");
      socket.off("accepted_request");
      socket.off("operation_failed");
      socket.disconnect();
    };
  }, [
    session?.user?.id,
    setCurrentChatData,
    currentGroupData,
    currentGroup,
    location.pathname,
  ]);

  useEffect(() => {});
  return (
    <SocketContext.Provider value={{ currentSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
