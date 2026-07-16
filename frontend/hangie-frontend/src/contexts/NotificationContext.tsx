import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../config/db.js";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { useChat } from "./ChatContext.js";

const NotificationContext = createContext({
  currentNotifications: null,
  setCurrentNotifications: (arg) => arg,
  markAllAsRead: () => {},
});

export const useNotification = () => {
  const context = useContext(NotificationContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error(
      "useNotification deve essere usato all'interno di un ChatProvider",
    );
  }

  return context;
};

// all'inizio non è send sui messaggi perchè non esiste dati di chat

export const NotificationProvider = ({ children }) => {
  const [currentNotifications, setCurrentNotifications] = useState({
    unread: [],
    read: [],
  });
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const { currentChatData, setCurrentChatData, setGroupsData, groupsData } =
    useChat();
  const getDbNotifications = async () => {
    if (!session?.user?.id) return;
    const { data: notificationData, error: notificationError } = await supabase
      .from("notifiche")
      .select(
        `
    type,
    sender_id,
    user_id,
    receiver:utenti!notifiche_user_id_fkey (
      nome,
      handle,
      profile_pic
      ),
      sender:utenti!notifiche_sender_id_fkey (
        nome,
        handle,
        profile_pic
    ),
    group_id,
    gruppo:gruppi!notifiche_group_id_fkey (
    nome
    ),
    messaggio:messaggi!notifiche_message_id_fkey (
    content
    ),
    created_at,
    is_read`,
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    notificationData;
    if (notificationError) return;
    const read = notificationData.filter((notif) => {
      if (notif.is_read) return notif;
    });
    const unread = notificationData.filter((notif) => {
      if (!notif.is_read) return notif;
    });
    setCurrentNotifications({ read, unread });
  };
  useEffect(() => {
    getDbNotifications();
  }, [session?.user?.id]);
  useEffect(() => {
    if (currentSocket) {
      // 1. Gestione nuova notifica (real-time o recuperata all'avvio)
      currentSocket.on("new_notification", (data) => {
        console.log("NOTIFICA RICEVUTA", data);
        if (data.user_id === session?.user?.id) {
          setCurrentNotifications((prev) => {
            // Assicuriamoci che unread sia un array (fallback su array vuoto se undefined)
            const currentUnread = prev.unread || [];

            // 🛡️ Controllo anti-duplicato: verifichiamo se la notifica esiste già
            const exists = currentUnread.some(
              (n) =>
                n.notification_id === data.notification_id ||
                (n.group_id === data.group_id &&
                  n.created_at === data.created_at),
            );

            if (exists) return prev; // Non aggiorna lo stato se è già presente

            return {
              read: prev.read || [],
              unread: [data, ...currentUnread], // ✅ Aggiunge in testa mantenendo la cronologia
            };
          });
        }
      });

      // 2. Pulizia notifiche per gruppo letto
      currentSocket.on("clear_notifications_count", (data) => {
        if (data.user_id === session?.user?.id) {
          setCurrentNotifications((prev) => {
            const currentUnread = prev.unread || [];
            const currentRead = prev.read || [];

            const newlyRead = currentUnread.filter(
              (n) => String(n.group_id) === String(data.group_id),
            );
            const remainingUnread = currentUnread.filter(
              (n) => String(n.group_id) !== String(data.group_id),
            );

            return {
              read: [
                ...newlyRead.map((n) => ({ ...n, is_read: true })),
                ...currentRead,
              ],
              unread: remainingUnread,
            };
          });
        }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("new_notification");
        currentSocket.off("clear_notifications_count");
      }
    };
  }, [currentSocket, session?.user?.id]);
  useEffect(() => {
    console.log("cambio notifiche", currentNotifications);
  }, [currentNotifications?.unread.length]);
  const markAllAsRead = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("notifiche")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Errore durante l'aggiornamento delle notifiche:", error);
      return;
    }

    setCurrentNotifications((prev) => {
      const currentUnread = prev.unread || [];
      const currentRead = prev.read || [];

      // Mappiamo le notifiche non lette a lette
      const newlyRead = currentUnread.map((n) => ({ ...n, is_read: true }));

      // Creiamo un set di ID già presenti in newlyRead per evitare di duplicarli
      // se per caso erano già finiti o parzialmente presenti in prev.read
      const newlyReadIds = new Set(
        newlyRead.map((n) => n.notification_id).filter(Boolean),
      );

      const filteredExistingRead = currentRead.filter(
        (n) => !newlyReadIds.has(n.notification_id),
      );

      return {
        unread: [],
        read: [...newlyRead, ...filteredExistingRead],
      };
    });
  };
  return (
    <NotificationContext.Provider
      value={{
        currentNotifications,
        setCurrentNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
