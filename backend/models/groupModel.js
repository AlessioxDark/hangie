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
    const { group_id } = req.params;
    const user_id = user.id;

    const [
      { data: participantRow, error: accessError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("partecipanti_gruppo")
        .select(`gruppi:group_id(*), utenti:partecipante_id(*)`)
        .eq("group_id", group_id)
        .eq("partecipante_id", user_id)
        .maybeSingle(),
      supabase
        .from("messaggi")
        .select("*,utenti(*),messaggi_status(*)")
        .eq("group_id", group_id)
        .order("sent_at", { ascending: true }),
    ]);
    if (messagesError) throw messagesError;

    if (accessError || !participantRow) {
      return {
        data: null,
        error: { message: "Gruppo non trovato o accesso negato.", status: 403 },
      };
    }
    const groupDetails = participantRow.gruppi;

    const messages = messagesData || [];

    const eventIds = messages
      .filter((m) => m.type === "event" && m.event_id)
      .map((m) => m.event_id); // Se non ci sono messaggi di tipo evento, saltiamo la query per evitare errori con .in() vuoti

    let eventDetail = {};
    if (eventIds.length > 0) {
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

      if (eventsError) throw eventsError;

      const safeEventsDetails = (eventsDetails || []).map((e) => {
        // ✅ FIX SICUREZZA: Optional chaining e fallback su "pending" se la risposta non esiste
        const risposta = e.risposte_evento?.find((r) => r.user_id == user.id);
        return {
          ...e,
          status: risposta ? risposta.status : "pending",
        };
      });

      eventDetail = safeEventsDetails.reduce((acc, event) => {
        acc[event.event_id] = event;
        return acc;
      }, {});
    }

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
    const user = req.user;

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
      .select("user_id, is_creator, status, event_id")
      .in("event_id", eventIds);
    // .eq("eventi.gruppi.group_id", group_id);
    if (risposteError) throw risposteError;

    const newRisposte = (risposte || []).reduce((acc, current) => {
      const eId = current.event_id;
      if (!acc[eId]) acc[eId] = [];
      acc[eId].push({
        is_creator: current.is_creator,
        user_id: current.user_id,
        status: current.status,
      });
      return acc;
    }, {});

    const newData = eventsData.map((e) => {
      const currentEventId = e?.event_id;
      const rispostePerEvento = newRisposte[currentEventId] || [];

      // Cerchiamo la risposta dell'utente loggato all'interno di questo evento
      const userStatusRecord = rispostePerEvento.find(
        (r) => r.user_id === user.id,
      );

      return {
        ...e,
        partecipanti: rispostePerEvento,
        // ✅ Se l'utente non ha una risposta registrata, va in "pending" invece di crashare
        status: userStatusRecord ? userStatusRecord.status : "pending",
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

    // 1. Rimuoviamo il partecipante dal gruppo
    const { data: deleteData, error: deleteError } = await supabase
      .from("partecipanti_gruppo")
      .delete()
      .eq("group_id", group_id)
      .eq("partecipante_id", user.id);

    if (deleteError) throw deleteError;

    // NOTA: Le risposte di questo utente agli eventi del gruppo NON serve cancellarle a mano!
    // Se un domani l'evento viene eliminato, si cancelleranno in automatico.
    // Se invece vuoi rimuoverle subito perché l'utente è uscito, la cascata su "utenti" non basta,
    // quindi la facciamo qui in modo rapido e sicuro.
    const { data: rowsToDelete, error: ErrorRowsDelete } = await supabase
      .from("risposte_eventi")
      .select("response_id, eventi(group_id)")
      .eq("user_id", user.id);

    if (!ErrorRowsDelete && rowsToDelete) {
      const newRowsToDelete = rowsToDelete
        .filter((r) => r.eventi?.group_id === group_id)
        .map((r) => r.response_id);

      if (newRowsToDelete.length > 0) {
        await supabase
          .from("risposte_eventi")
          .delete()
          .in("response_id", newRowsToDelete);
      }
    }

    const { data: participantsData, error: participantsError } = await supabase
      .from("partecipanti_gruppo")
      .select("*")
      .eq("group_id", group_id)
      .order("joinedAt", { ascending: true });

    if (participantsError) throw participantsError;

    const count = participantsData ? participantsData.length : 0;

    // ==========================================
    // CASO A: IL GRUPPO È VUOTO -> PULIZIA TOTALMENTE DELEGATA AL DB
    // ==========================================
    if (count === 0) {
      // 🚨 Lo storage va pulito prima di distruggere i record del DB,
      // altrimenti perderemmo i riferimenti (gli ID degli eventi) per fare il listing dei file.
      const { data: messages, error: messageError } = await supabase
        .from("messaggi")
        .select("event_id")
        .eq("group_id", group_id)
        .eq("type", "event");

      if (!messageError && messages && messages.length > 0) {
        const eventIds = messages.map((m) => m.event_id).filter(Boolean);

        // Svuotiamo le cartelle storage degli eventi associati
        for (const eventId of eventIds) {
          const { data: folderContent } = await supabase.storage
            .from("eventi")
            .list(eventId);
          if (folderContent && folderContent.length > 0) {
            const filesToDelete = folderContent.map(
              (file) => `${eventId}/${file.name}`,
            );
            await supabase.storage.from("eventi").remove(filesToDelete);
          }
        }
      }

      // Svuotiamo la cartella delle copertine del gruppo nello Storage
      const { data: groupFolderContent } = await supabase.storage
        .from("group_cover_imgs")
        .list(group_id);

      if (groupFolderContent && groupFolderContent.length > 0) {
        const filesToDelete = groupFolderContent.map(
          (file) => `${group_id}/${file.name}`,
        );
        await supabase.storage.from("group_cover_imgs").remove(filesToDelete);
      }

      // Grazie ai  CASCADE, questa singola query cancella:
      // - Messaggi
      // - Stati dei messaggi
      // - Notifiche
      // - Eventi di gruppo ed Eventi fisici
      // - Immagini dei record evento
      // - Risposte di tutti gli utenti agli eventi del gruppo
      const { error: GroupsError } = await supabase
        .from("gruppi")
        .delete()
        .eq("group_id", group_id);

      if (GroupsError) throw GroupsError;

      return { data: deleteData, error: null };
    }

    // ==========================================
    // CASO B: RIMANGONO PARTECIPANTI -> GESTIONE AMMINISTRATORI
    // ==========================================
    const { data: groupData, error: groupError } = await supabase
      .from("gruppi")
      .select("*")
      .eq("group_id", group_id)
      .single();

    if (groupError) throw groupError;

    const isAdmin = participantsData.some((p) => p.role === "admin");
    const isCreatorStillIn = participantsData.some(
      (p) => p.partecipante_id === groupData.createdBy,
    );

    // Se non ci sono più admin, promuoviamo il membro più anziano (indice 0 con joinedAt ASC)
    if (!isAdmin && participantsData.length > 0) {
      await supabase
        .from("partecipanti_gruppo")
        .update({ role: "admin" })
        .eq("group_id", group_id)
        .eq("partecipante_id", participantsData[0].partecipante_id);
    }

    // Se il proprietario originario è uscito, passiamo la corona al membro più anziano
    if (!isCreatorStillIn && participantsData.length > 0) {
      await supabase
        .from("gruppi")
        .update({ createdBy: participantsData[0].partecipante_id })
        .eq("group_id", group_id);
    }

    return { data: deleteData, error: null };
  } catch (err) {
    console.error("Errore leave group:", err);
    return { data: null, error: err.message || err };
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
