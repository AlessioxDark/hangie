const supabase = require("../config/db");
const getAll = async (req) => {
  try {
    const user = req.user;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .select(
        `
      gruppi(
      *,
      messaggi(*),
      partecipanti_gruppo(*,
      utenti(nome, handle, user_id, profile_pic
      )
    )
  )  
      `,
      )
      .eq("partecipante_id", user.id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const getGroup = async (req) => {
  try {
    const user = req.user;
    if (!user) {
      throw {
        message: "Utente non autenticato.",
      };
    }
    const { group_id } = req.params;
    const user_id = user.id;

    const [
      { data: participantRow, error: accessError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("partecipanti_gruppo")
        .select(`gruppi:group_id(*), utenti:partecipante_id(*)`) // Seleziona il gruppo e i dati del partecipante che accede
        .eq("group_id", group_id)
        .eq("partecipante_id", user_id)
        .single(),
      supabase
        .from("messaggi")
        .select("*,utenti(*),messaggi_status(*)")
        .eq("group_id", group_id)
        .order("sent_at", { ascending: true }),
    ]);

    if (accessError || !participantRow) {
      throw {
        message: "Gruppo non trovato o accesso negato.",
      };
    }
    const groupDetails = participantRow.gruppi;

    if (messagesError) throw messagesError;
    const messages = messagesData || [];

    const eventIds = messages
      .filter((m) => m.type === "event" && m.event_id)
      .map((m) => m.event_id);

    const { data: eventsDetails, error: eventsError } = await supabase
      .from("eventi")
      .select(
        `*,
            utente:utenti(nome, user_id),
            luogo:luoghi(nome, citta, indirizzo),
            risposte_evento:risposte_eventi(*, utenti(profile_pic, user_id, nome))
            `,
      )
      .in("event_id", eventIds);
    const newEventsDetails = eventsDetails.map((e) => {
      const risposta = e.risposte_evento.find((r) => r.user_id == user.id);
      return { ...e, status: risposta.status };
    });
    if (eventsError) throw eventsError;

    const eventDetail = newEventsDetails.reduce((acc, event) => {
      acc[event.event_id] = event;
      return acc;
    }, {});

    const definitiveMessages = messages.map((m) => {
      const isUser = m.user_id === user.id;
      const statuses = m.messaggi_status || [];
      const event_details =
        m.type === "event" ? eventDetail[m.event_id] || null : null;
      const isRead =
        statuses.length > 0 && statuses.every((s) => s.status === "read");

      const isSent =
        statuses.length > 0 &&
        statuses.every((s) => s.status === "delivered" || s.status === "read");
      return {
        ...m,
        isUser,
        isSent,
        isRead,
        event_details,
        utenti: m.utenti,
      };
    });

    return {
      data: {
        ...groupDetails,
        messaggi: definitiveMessages,
        partecipanti_gruppo: participantRow,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
const getEvents = async (req) => {
  try {
    const { group_id } = req.params;

    const { data: eventsData, error: eventsError } = await supabase
      .from("eventi_gruppo")

      .select(
        "*, eventi(event_id,costo,data,titolo,utenti (user_id, nome, profile_pic),luoghi(*),risposte_eventi(*),descrizione, data_scadenza,cover_img,event_imgs(*),gruppi(*, partecipanti_gruppo(*)))",
      )
      .eq("group_id", group_id);
    if (eventsError) throw eventsError;
    const eventIds = eventsData.map((e) => e.eventi.event_id);

    const { data: risposte, error: risposteError } = await supabase
      .from("risposte_eventi")
      .select(
        "user_id,is_creator,status,eventi!inner( event_id, gruppi!inner(group_id))",
      )
      .in("eventi.event_id", eventIds)
      .eq("eventi.gruppi.group_id", group_id);
    if (risposteError) throw risposteError;

    const newRisposte = risposte.reduce((acc, event) => {
      if (!acc[event.eventi.event_id]) acc[event.eventi.event_id] = [];
      acc[event.eventi.event_id].push({
        is_creator: event.is_creator,
        user_id: event.user_id,
        status: event.status,
      });
      return acc;
    }, {});
    const user = req.user;
    const newData = eventsData.map((e) => {
      const eventStatus = newRisposte[e.eventi.event_id].find(
        (r) => r.user_id == user.id,
      );
      return {
        ...e,
        partecipanti: newRisposte[e.eventi.event_id],
        status: eventStatus.status,
      };
    });
    return { data: newData, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const getEvent = async (req) => {
  try {
    const { event_id } = req.params;

    const { data, error } = await supabase
      .from("eventi")
      .select("*")
      .eq("event_id", event_id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};

const newGroup = async (req) => {
  try {
    const user = req.user;
    const { nome, descrizione, participants } = req.body;
    const { data: groupData, error: groupError } = await supabase
      .from("gruppi")
      .insert([{ nome, descrizione, createdBy: user.id }])
      .select("*")
      .single();
    if (groupError) throw groupError;
    const groupId = groupData.group_id;
    const newPartecipantiArray = participants.map((participant) => {
      return {
        partecipante_id: participant.user_id,
        group_id: groupId,
        role: "member",
      };
    });

    newPartecipantiArray.push({
      partecipante_id: user.id,
      group_id: groupId,
      role: "admin",
    });
    const { error: participantsError } = await supabase
      .from("partecipanti_gruppo")
      .insert(newPartecipantiArray);
    if (participantsError) throw participantsError;

    return {
      data: {
        group_id: groupId,
        groupData: groupData,
        participants,
        creator: user,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};

const modify = async (req) => {
  try {
    const { group_id } = req.params;
    const body = req.body;
    if (body.isAdmin) {
      const { data, error } = await supabase
        .from("gruppi")
        .update([{ [body.field]: body.fieldValue }])
        .eq("group_id", group_id);

      if (error) throw error;
      return { data, error: null };
    } else {
      throw { message: "Solo gli admin possono modificare il gruppo" };
    }
  } catch (err) {
    return { data: null, error: err };
  }
};

const leave = async (req) => {
  try {
    const { group_id } = req.params;
    const user = req.user;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .delete()
      .eq("group_id", group_id)
      .eq("partecipante_id", user.id);
    if (error) throw error;
    const { data: rowsToDelete, error: ErrorRowsDelete } = await supabase
      .from("risposte_eventi")
      .select("response_id,eventi(group_id)")
      .eq("user_id", user.id);
    if (ErrorRowsDelete) throw ErrorRowsDelete;
    const newRowsToDelete = rowsToDelete
      .filter((r) => r.eventi.group_id == group_id)
      .map((r) => r.response_id);
    const { error: eventsError } = await supabase
      .from("risposte_eventi")
      .delete()
      .in("response_id", newRowsToDelete);
    if (eventsError) throw eventsError;

    const { data: participantsData, error: participantsError } = await supabase
      .from("partecipanti_gruppo")
      .select("*")
      .eq("group_id", group_id)
      .order("joinedAt", { ascending: false });
    if (participantsError) throw participantsError;

    const { data: groupData, error: groupError } = await supabase
      .from("gruppi")
      .select("*")
      .eq("group_id", group_id)
      .single();
    if (groupError) throw groupError;
    const { count, error: countError } = await supabase
      .from("partecipanti_gruppo")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group_id);
    if (countError) throw countError;

    if (count == 0) {
      const { error: notificanError } = await supabase
        .from("notifiche")
        .delete()
        .eq("group_id", group_id);
      if (notificanError) throw notificanError;
      const { data: messages, error: messageError } = await supabase
        .from("messaggi")
        .select("message_id,type,event_id")
        .eq("group_id", group_id);

      if (messageError) throw messageError;
      const messageEvents = messages.filter((m) => m.type == "event");
      const messageIds = messages.map((m) => m.message_id);
      if (messages && messages.length > 0) {
        // 2. Elimina gli stati per quei messaggi
        await supabase
          .from("messaggi_status")
          .delete()
          .in("messaggio_id", messageIds);
      }
      if (messageEvents) {
        const messageEventsEventsIds = messageEvents.map((m) => m.event_id);
        for (const eventId of messageEventsEventsIds) {
          if (!eventId) continue; // Salta se per caso l'ID è nullo

          // 1. Elenca i file nella cartella dell'evento
          const { data: folderContent, error: folderError } =
            await supabase.storage.from("eventi").list(eventId);
          if (folderError) throw folderError;

          if (folderContent && folderContent.length > 0) {
            // 2. Crea i percorsi completi
            const filesToDelete = folderContent.map(
              (file) => `${eventId}/${file.name}`,
            );

            // 3. Elimina i file dallo storage
            await supabase.storage.from("eventi").remove(filesToDelete);
          }
        }
        const { error: eventsError } = await supabase
          .from("eventi")
          .delete()
          .in("event_id", messageEventsEventsIds);

        if (eventsError) throw eventsError;
        const { error: groupEventsError } = await supabase
          .from("eventi_gruppo")
          .delete()
          .eq("group_id", group_id);

        if (groupEventsError) throw groupEventsError;
      }
      const { error: messagesStatusError } = await supabase
        .from("messaggi_status")
        .delete()
        .in("message_id", messageIds);
      if (messagesStatusError) throw messagesStatusError;
      const { error: messagesError } = await supabase
        .from("messaggi")
        .delete()
        .in("message_id", messageIds);
      if (messagesError) throw messagesError;

      const { data: folderContent, error: folderError } = await supabase.storage
        .from("group_cover_imgs")
        .list(group_id);
      if (folderError) throw folderError;

      if (folderContent && folderContent.length > 0) {
        // Trasforma la lista in percorsi completi: "ID_GRUPPO/file.jpg"
        const filesToDelete = folderContent.map(
          (file) => `${group_id}/${file.name}`,
        );

        // Elimina i file: questo farà sparire la cartella
        await supabase.storage.from("group_cover_imgs").remove(filesToDelete);
      }

      const { error: GroupsError } = await supabase
        .from("gruppi")
        .delete()
        .eq("group_id", group_id);
      if (GroupsError) throw GroupsError;
      return { data, error: null };
    }

    const isAdmin = participantsData.some((p) => p.role == "admin");
    const isCreator = participantsData.some(
      (p) => p.partecipante_id == groupData.createdBy,
    );
    if (!isAdmin) {
      const { error: adminError } = await supabase
        .from("partecipanti_gruppo")
        .update({ role: "admin" })
        .eq("partecipante_id", participantsData[0].partecipante_id);
      if (adminError) throw adminError;
    }
    if (!isCreator) {
      const { error: adminGroupError } = await supabase
        .from("gruppi")
        .update({ createdBy: participantsData[0].partecipante_id })
        .eq("group_id", group_id);
      if (adminGroupError) throw adminGroupError;
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const addParticipants = async (req) => {
  try {
    const { group_id } = req.params;

    const participantsIds = req.body;

    const participantsInsert = participantsIds.map((participant) => {
      return {
        group_id,
        partecipante_id: participant.user_id,
        role: "member",
      };
    });
    const { error: participantInsertError } = await supabase
      .from("partecipanti_gruppo")
      .insert(participantsInsert);
    if (participantInsertError) throw participantInsertError;
    const { data: events, error: eventsError } = await supabase
      .from("eventi")
      .select("event_id")
      .eq("group_id", group_id);

    if (eventsError) throw eventsError;

    const insertData = events.flatMap((e) => {
      return participantsIds.map((p) => ({
        event_id: e.event_id,
        user_id: p.user_id,
        status: "pending",
        is_creator: false,
      }));
    });

    const { data: groupEventsData, error: insertError } = await supabase
      .from("risposte_eventi")
      .insert(insertData).select(`
    event_id,
    status,
    is_creator,
    created_at,
    user_id,
    utente:utenti(*) 
  `); // Fondamentale per avere i nomi degli utenti nel frontend
    if (insertError) throw insertError;

    const finalEventsResponses = groupEventsData.reduce((acc, response) => {
      if (!acc[response.event_id]) acc[response.event_id] = [];

      acc[response.event_id].push({
        utenti: { user_id: response.user_id },
        status: response.status,
        is_creator: response.is_creator,
        created_at: response.created_at,
      });
      return acc;
    }, {});
    return { data: { groupEventsData, finalEventsResponses }, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const removeParticipant = async (req) => {
  try {
    const { group_id } = req.params;
    const { user_id } = req.body;
    const { error: participantError } = await supabase
      .from("partecipanti_gruppo")
      .delete()
      .eq("group_id", group_id)
      .eq("partecipante_id", user_id);
    if (participantError) throw participantError;
    const { data: rowsToDelete, error: ErrorRowsDelete } = await supabase
      .from("risposte_eventi")
      .select("response_id,eventi(group_id)")
      .eq("user_id", user_id);
    if (ErrorRowsDelete) throw ErrorRowsDelete;
    const newRowsToDelete = rowsToDelete
      .filter((r) => r.eventi.group_id == group_id)
      .map((r) => r.response_id);
    const { error: eventsError } = await supabase
      .from("risposte_eventi")
      .delete()
      .in("response_id", newRowsToDelete);
    if (eventsError) throw eventsError;
    return { data: {}, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const modifyParticipant = async (req) => {
  try {
    const { group_id } = req.params;
    const { user_id } = req.body;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .update({ role: "admin" })
      .eq("group_id", group_id)
      .eq("partecipante_id", user_id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};

module.exports = {
  getAll,
  getGroup,
  getEvent,
  newGroup,
  modify,
  getEvents,
  leave,
  addParticipants,
  removeParticipant,
  modifyParticipant,
};
