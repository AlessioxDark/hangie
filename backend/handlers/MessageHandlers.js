const supabase = require("../config/db");

const messageHandlers = (io, socket) => {
  socket.on("send_message", async (message, group_id, token, local_id) => {
    try {
      const {
        data: { user },
        error: tokenError,
      } = await supabase.auth.getUser(token);
      if (tokenError) throw tokenError;

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("partecipanti_gruppo")
          .select("*,user_id:partecipante_id")
          .eq("group_id", group_id);
      if (participantsError) throw participantsError;

      const { data: messageData, error: messageError } = await supabase
        .from("messaggi")
        .insert([{ content: message, user_id: user.id, group_id }])
        .select("message_id")
        .single();
      if (messageError) throw messageError;

      const messageId = messageData.message_id;

      const rowStatus = participantsData
        .filter((p) => p.user_id !== user.id)
        .map((p) => ({ message_id: messageId, user_id: p.user_id }));

      const otherParticipants = participantsData.filter(
        (p) => p.user_id !== user.id,
      );
      const notificationInsert = otherParticipants.map((p) => ({
        type: "new_message",
        sender_id: user.id,
        is_read: false,
        group_id,
        user_id: p.user_id,
        message_id: messageId,
      }));
      console.log("notifiche inserito", notificationInsert);

      await supabase.from("messaggi_status").insert(rowStatus);

      const { data: sender, error: userError } = await supabase
        .from("utenti")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (userError) throw userError;

      participantsData.forEach((p) => {
        io.to(p.user_id).emit("receive_message", {
          message,
          message_id: messageId,
          local_id, // Passato correttamente senza filtri o nodi
          group_id,
          sender_id: user.id,
          sender,
        });
      });

      await supabase.from("notifiche").insert(notificationInsert);
    } catch (err) {
      console.error("Errore irreversibile:", err);
      socket.emit("operation_failed", { type: "chat", message: "Errore..." });
    }
  });
  socket.on("message_sent", async (message_id, user_id, group_id) => {
    try {
      const [
        { error: statusError },
        { data: partecipantiDB, error: participantsError },
      ] = await Promise.all([
        supabase
          .from("messaggi_status")
          .update({ status: "delivered" })
          .eq("user_id", user_id)
          .eq("message_id", message_id),
        supabase
          .from("partecipanti_gruppo")
          .select("user_id:partecipante_id")
          .eq("group_id", group_id),
      ]);
      if (statusError) throw statusError;
      if (participantsError) throw participantsError;
      const { count, error: countError } = await supabase
        .from("messaggi_status")
        .select("*", { count: "exact", head: true })
        .eq("message_id", message_id)
        .eq("status", "sent");
      if (countError) throw countError;

      if (count == 0) {
        partecipantiDB.forEach((p) => {
          io.to(p.user_id).emit("message_arrived", {
            message_id,
            group_id,
          });
        });
      }
      const { data: unreadNotifications, error: notificationsError } =
        await supabase
          .from("notifiche")
          .select(
            `
          notifica_id,
          type,
          group_id,
          user_id,
          created_at,
          is_read,
          sender_id
        `,
          )
          .eq("user_id", user_id)
          .eq("is_read", false)
          .order("created_at", { ascending: true }); // In ordine cronologico (dalla più vecchia)
      if (notificationsError) throw notificationsError;

      if (unreadNotifications && unreadNotifications.length > 0) {
        console.log("mando notifica");
        unreadNotifications.forEach((notif) => {
          socket.emit("new_notification", {
            type: notif.type,
            sender_id: notif.sender_id,
            group_id: notif.group_id,
            gruppo: { group_id: notif.group_id },
            user_id: notif.user_id,
            created_at: notif.created_at,
            is_read: notif.is_read,
            notification_id: notif.notifica_id, // Utile per poterla segnare come letta in seguito
          });
        });
      }
    } catch (err) {
      socket.emit("operation_failed", {
        type: "chat",
        message: "Qualcosa è andato storto, riprova tra poco.",
      });
    }
  });

  socket.on("message_read_bulk", async (message_ids, user_id, group_id) => {
    try {
      const [
        { data: partecipantiDB, error: errorParticipants },
        { error: errorStatus },
        { data: notificationData, error: errorNotification },
      ] = await Promise.all([
        supabase
          .from("partecipanti_gruppo")
          .select("user_id:partecipante_id")
          .eq("group_id", group_id),
        supabase
          .from("messaggi_status")
          .update({ status: "read" })
          .eq("user_id", user_id)
          .in("message_id", message_ids),
        supabase
          .from("notifiche")
          .update({ is_read: "true" })
          .eq("user_id", user_id)
          .eq("group_id", group_id)
          .eq("is_read", false)
          .select("*"),
      ]);
      if (errorParticipants) throw errorParticipants;
      if (errorStatus) throw errorStatus;
      if (errorNotification) throw errorNotification;

      if (notificationData && notificationData.length > 0) {
        io.to(user_id).emit("clear_notifications_count", {
          group_id,
          user_id,
        });
      }
      const currentMemberIds = partecipantiDB.map((p) => p.user_id);
      const { count, error: countError } = await supabase
        .from("messaggi_status")
        .select("user_id, status, message_id", { count: "exact", head: true })
        .in("message_id", message_ids)
        .in("user_id", currentMemberIds)
        .neq("status", "read");

      if (countError) throw countError;
      if (count == 0) {
        partecipantiDB.forEach((p) => {
          io.to(p.user_id).emit("give_read_bulk", {
            message_ids,
            group_id: group_id,
          });
        });
      }
    } catch (err) {
      socket.emit("operation_failed", {
        type: "chat",
        message: "Qualcosa è andato storto, riprova tra poco.",
      });
    }
  });
  socket.on(
    "send_event",
    async (eventId, group_id, eventDetails, messageDetails) => {
      try {
        const { data: participants, error: participantsError } = await supabase
          .from("partecipanti_gruppo")
          .select("*")
          .eq("group_id", group_id);
        if (participantsError) throw participantsError;
        if (!participants) throw { message: "Partecipanti non trovati" };

        const risposte_evento = participants.map((p) => {
          return {
            status:
              eventDetails.created_by == p.partecipante_id
                ? "accepted"
                : "pending",
            utenti: { user_id: p.partecipante_id },
          };
        });

        participants.forEach((p) => {
          io.to(p.partecipante_id).emit("sent_event", {
            eventi: { ...eventDetails, event_id: eventId, risposte_evento },
            messageDetails,
            group_id,
          });
        });
      } catch (err) {
        socket.emit("operation_failed", {
          type: "chat",
          message: "Qualcosa è andato storto, riprova tra poco.",
        });
      }
    },
  );

  socket.on("identify_user", async (userId) => {
    console.log("IDENTIFICO USER");
    try {
      // 1. Aggiorna tutti i messaggi 'sent' dell'utente a 'delivered'
      const { data: updatedStatuses, error: updateError } = await supabase
        .from("messaggi_status")
        .update({ status: "delivered" })
        .eq("user_id", userId)
        .eq("status", "sent")
        .select("message_id");

      if (updateError) throw updateError;

      if (updatedStatuses && updatedStatuses.length > 0) {
        console.log("update");
        const messageIds = [
          ...new Set(updatedStatuses.map((s) => s.message_id)),
        ];

        // 2. Recuperiamo i dettagli dei messaggi e i relativi stati rimanenti in parallelo
        const [
          { data: messagesData, error: messagesError },
          { data: remainingSentData, error: remainingSentError },
        ] = await Promise.all([
          supabase
            .from("messaggi")
            .select("message_id, group_id, user_id")
            .in("message_id", messageIds),
          supabase
            .from("messaggi_status")
            .select("message_id, status")
            .in("message_id", messageIds)
            .eq("status", "sent"),
        ]);

        if (messagesError) throw messagesError;
        if (remainingSentError) throw remainingSentError;

        if (messagesData) {
          const stillSentSet = new Set(
            (remainingSentData || []).map((r) => r.message_id),
          );

          // Filtriamo i messaggi che sono stati consegnati a TUTTI (nessuno ha più status 'sent')
          const fullyDeliveredMessages = messagesData.filter(
            (msg) => !stillSentSet.has(msg.message_id),
          );

          if (fullyDeliveredMessages.length > 0) {
            const groupIds = [
              ...new Set(fullyDeliveredMessages.map((msg) => msg.group_id)),
            ];

            // Recuperiamo tutti i partecipanti per tutti questi gruppi in un colpo solo
            const { data: partecipantiDB, error: participantsError } =
              await supabase
                .from("partecipanti_gruppo")
                .select("group_id, user_id:partecipante_id")
                .in("group_id", groupIds);

            if (participantsError) throw participantsError;

            if (partecipantiDB) {
              // Raggruppiamo i partecipanti per group_id
              const participantsByGroup = partecipantiDB.reduce((acc, p) => {
                if (!acc[p.group_id]) acc[p.group_id] = [];
                acc[p.group_id].push(p.user_id);
                return acc;
              }, {});

              // Inviamo l'evento message_arrived a tutti i partecipanti di ciascun gruppo
              for (const msg of fullyDeliveredMessages) {
                const targetUsers = participantsByGroup[msg.group_id] || [];
                targetUsers.forEach((userIdToNotify) => {
                  io.to(userIdToNotify).emit("message_arrived", {
                    message_id: msg.message_id,
                    group_id: msg.group_id,
                  });
                });
              }
            }
            console.log("ci arrivo");
          }
        }
      }
    } catch (err) {
      console.error(
        "Errore durante l'aggiornamento della consegna dei messaggi:",
        err,
      );
    }
  });
};
module.exports = messageHandlers;
