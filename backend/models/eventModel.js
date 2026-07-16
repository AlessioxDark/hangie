const supabase = require("../config/db");

const getAll = async (req) => {
  try {
    const EVENTSINPAGE = 12;
    console.log(req.query);
    const offset = parseInt(req.query.offset, 10) || 0;
    const user = req.user;

    const [
      { data: acceptedEvents, error: acceptedEventsError },
      { data: pendingEvents, error: pendingEventsError },
    ] = await Promise.all([
      supabase
        .from("risposte_eventi")
        .select(
          "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome,profile_pic),luoghi(*),gruppi(group_id,nome,group_cover_img,group_id,partecipanti_gruppo(partecipante_id)))",
        )
        .range(offset, offset + EVENTSINPAGE - 1)
        .eq("user_id", user.id)
        .eq("status", "accepted"),
      supabase
        .from("risposte_eventi")
        .select(
          "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome,profile_pic),luoghi(*),gruppi(group_id,nome,group_cover_img,partecipanti_gruppo(partecipante_id)))",
        )
        .limit(3)
        .eq("user_id", user.id)
        .eq("status", "pending"),
    ]);
    if (acceptedEventsError) throw acceptedEventsError;
    if (pendingEventsError) throw pendingEventsError;
    const eventsList = [...acceptedEvents, ...pendingEvents];
    if (eventsList.length == 0) return { data: [], error: null };
    const eventIds = eventsList.map((e) => e?.event_id);

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("event_id, status, utente:utenti(*), created_at, is_creator")
        .in("event_id", eventIds);

    if (eventParticipantsError) throw eventParticipantsError;

    const eventParticipantsMap = (eventParticipants || []).reduce(
      (acc, curr) => {
        const eId = curr.event_id;
        if (!eId) return acc;

        if (!acc[eId]) acc[eId] = [];
        acc[eId].push({
          utenti: curr.utente,
          status: curr.status,
          is_creator: curr.is_creator,
          created_at: curr.created_at,
        });
        return acc;
      },
      {},
    );

    if (eventParticipantsError) throw eventParticipantsError;

    const finalData = eventsList.map((e) => {
      return {
        ...e,
        partecipanti: eventParticipantsMap[e?.event_id] || [], // Fallback ad array vuoto se non ci sono ancora risposte
      };
    });
    return { data: finalData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

const deleteEvent = async (req) => {
  try {
    const { event_id } = req.params;

    // 1. 📂 PULIZIA STORAGE: Gestiamo i file PRIMA di distruggere i record del DB
    const { data: files, error: listError } = await supabase.storage
      .from("eventi")
      .list(`${event_id}`);

    if (listError) throw listError;

    if (files && files.length > 0) {
      const filesToRemove = files.map((x) => `${event_id}/${x.name}`);
      const { error: deleteStorageError } = await supabase.storage
        .from("eventi")
        .remove(filesToRemove);

      if (deleteStorageError) throw deleteStorageError;
    }

    // 2. 🔥 CANCELLAZIONE DB: Eliminiamo l'evento principale.
    // Grazie ai tuoi CASCADE, questa query eliminerà automaticamente:
    // - I record in "event_imgs"
    // - I record in "eventi_gruppo"
    // - I record in "risposte_eventi"
    const { error: eventError } = await supabase
      .from("eventi")
      .delete()
      .eq("event_id", event_id);

    if (eventError) throw eventError; // ✅ Corretto "err" in "error"

    return { data: { success: true }, error: null };
  } catch (err) {
    console.error("Errore durante l'eliminazione dell'evento:", err);
    return { error: err.message || err, data: null };
  }
};
const getEvent = async (req) => {
  try {
    const { event_id } = req.params;
    const user = req.user;

    const { data: eventData, error: eventError } = await supabase
      .from("risposte_eventi")
      .select(
        `event_id,
        user_id,
        status,
        eventi(
          event_id,
          costo,
          created_at,
          created_by,
          data,
          titolo,
          descrizione,
          data_scadenza,
          cover_img,
          event_imgs(*),
          utenti(user_id, nome, profile_pic),
          luoghi(*),
          gruppi(group_id, nome, group_cover_img, partecipanti_gruppo(partecipante_id))
        )`,
      )
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (eventError) throw eventError;

    if (!eventData) {
      return {
        data: null,
        error: { message: "Non sei invitato a questo evento", details: "" },
      };
    }

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status, user_id, utente:utenti(*), created_at, is_creator")
        .eq("event_id", event_id);

    if (eventParticipantsError) throw eventParticipantsError;

    // Formatta la lista partecipanti
    const newRisposte = eventParticipants.map((risposta) => ({
      utenti: risposta.utente,
      status: risposta.status,
      created_at: risposta.created_at,
      is_creator: risposta.is_creator,
    }));

    const finalData = {
      ...eventData,
      partecipanti: newRisposte,
    };

    return {
      data: finalData,
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};

const getOrCreateLuogo = async (realBody) => {
  const { nome_luogo, locationData } = realBody;
  if (!locationData || !locationData.place_id) {
    return {
      data: null,
      error: { message: "Dati geografici del luogo mancanti o non validi." },
    };
  }

  const { data: luogo, error } = await supabase
    .from("luoghi")
    .upsert(
      {
        place_id: locationData.place_id,
        nome: nome_luogo,
        indirizzo: locationData.indirizzo,
        citta: locationData.citta,
        cap: locationData.cap,
        lat: locationData.latitude, // 👈 Prende .latitude aggiornato
        lon: locationData.longitude, // 👈 Prende .longitude aggiornato
      },
      { onConflict: "place_id" },
    )
    .select("luogo_id")
    .single();

  if (error) return { data: null, error };
  return { data: luogo.luogo_id, error: null };
};
const newEvent = async (req) => {
  try {
    const user = req.user;
    if (!req.body || !req.body.data)
      throw { message: "Dati evento mancanti o malformati" };
    const { images, locationData, nome_luogo, ...realBody } = req.body.data;

    const { data: luogoId, error: luogoError } = await getOrCreateLuogo({
      nome_luogo,
      locationData,
    });
    if (luogoError) throw luogoError;

    const group_id = realBody.group_id;
    const { ...eventBody } = realBody;
    const { data: eventData, error: eventError } = await supabase
      .from("eventi")
      .insert([{ ...eventBody, luogo_id: luogoId, created_by: user.id }])
      .select("*")
      .single();
    if (eventError) throw eventError;
    const eventId = eventData.event_id;
    const [
      { data: messageData, error: errorMessage },
      { error: eventGroupError },
      { data: participantsData, error: participantsError },
    ] = await Promise.all([
      supabase
        .from("messaggi")
        .insert([
          {
            type: "event",
            event_id: eventId,
            user_id: user.id,
            group_id,
          },
        ])
        .select(
          "*, eventi(*,scadenza:data_scadenza, luogo:luoghi(*), utente:utenti(nome, user_id),gruppo:gruppi(*),cover_img,created_by)",
        )
        .single(),
      supabase.from("eventi_gruppo").insert([{ event_id: eventId, group_id }]),
      supabase
        .from("partecipanti_gruppo")
        .select("user_id:partecipante_id")
        .eq("group_id", group_id),
    ]);

    if (errorMessage) throw errorMessage;
    if (eventGroupError) throw eventGroupError;
    if (participantsError) throw participantsError;
    const answersToInsert = participantsData.map((participant) => {
      return {
        event_id: eventId,
        user_id: participant.user_id,
        status: participant.user_id === user.id ? "accepted" : "pending",
        is_creator: participant.user_id === user.id,
      };
    });

    const { error: answerError } = await supabase
      .from("risposte_eventi")
      .insert(answersToInsert);
    if (answerError) throw answerError;

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status,utente:utenti(*),eventi(*),created_at,is_creator")
        .eq("eventi.event_id", eventId);
    if (eventParticipantsError) throw eventParticipantsError;

    const newRisposte = eventParticipants.map((risposta) => {
      return {
        utenti: risposta.utente,
        user_id: risposta.utente.user_id,
        status: risposta.status,
        created_at: risposta.created_at,
        is_creator: risposta.is_creator,
      };
    });

    return {
      data: {
        event_id: eventId,
        group_id: messageData.group_id, // Fondamentale per la tua setMessagesMap
        messageDetails: {
          ...messageData,
          // Iniettiamo i dettagli calcolati direttamente nell'oggetto eventi
          eventi: {
            ...messageData.eventi,
            event_imgs: [],
            risposte_evento: [...newRisposte],
          },
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
const modifyResponse = async (req) => {
  try {
    const { event_id } = req.params;
    const { status, prevStatus } = req.body;
    const user = req.user;
    const { data: answerData, error: answerError } = await supabase
      .from("risposte_eventi")
      .update({ status })
      .eq("event_id", event_id)
      .eq("user_id", user.id);
    if (answerError) throw answerError;
    return { data: { ...answerData, prevStatus }, error: null };
  } catch (err) {
    return { data: null, err: err };
  }
};
const getSuspended = async (req) => {
  try {
    const EVENTSINPAGE = 12;
    const offset = parseInt(req.body.offset, 10) || 0; // ✅ Parsing sicuro dell'offset
    const user = req.user;

    // 1. Recupera gli eventi in stato "pending" (in sospeso) per l'utente corrente
    const { data: eventsList, error: eventsListError } = await supabase
      .from("risposte_eventi")
      .select(
        `
        event_id,
        status,
        eventi (
          event_id,
          costo,
          created_at,
          created_by,
          data,
          titolo,
          descrizione,
          data_scadenza,
          cover_img,
          event_imgs(*),
          utenti(user_id, nome, profile_pic),
          luoghi(*),
          gruppi(
            group_id,
            nome,
            group_cover_img,
            partecipanti_gruppo(partecipante_id)
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("status", "pending")
      .range(offset, offset + EVENTSINPAGE - 1);

    if (eventsListError) throw eventsListError;

    // Se non ci sono eventi in sospeso, restituiamo subito un array vuoto
    if (!eventsList || eventsList.length === 0) {
      return { data: [], error: null };
    }

    // Estraiamo gli ID degli eventi in modo sicuro filtrando eventuali null/undefined
    const eventIds = eventsList.map((e) => e?.event_id).filter(Boolean);

    // 2. Recupera i partecipanti per questi eventi (Query super ottimizzata e diretta su "event_id")
    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("event_id, status, utente:utenti(*), created_at, is_creator")
        .in("event_id", eventIds);

    if (eventParticipantsError) throw eventParticipantsError;

    // Mappiamo i partecipanti per un accesso O(1) velocissimo durante l'unione dei dati
    const eventParticipantsMap = (eventParticipants || []).reduce(
      (acc, curr) => {
        const eId = curr.event_id;
        if (!eId) return acc;

        if (!acc[eId]) acc[eId] = [];
        acc[eId].push({
          utenti: curr.utente,
          status: curr.status,
          is_creator: curr.is_creator,
          created_at: curr.created_at,
        });
        return acc;
      },
      {},
    );

    // 3. ✅ APPIATTIMENTO DATI E UNIONE: Puliamo la struttura per il frontend
    const finalData = eventsList.map((e) => {
      const eventDetails = e.eventi || {};
      return {
        ...eventDetails, // Dettagli dell'evento al primo livello del JSON
        user_status: e.status, // Lo stato dell'utente corrente (sarà sempre "pending")
        partecipanti: eventParticipantsMap[e.event_id] || [], // Array di risposte degli altri partecipanti
      };
    });

    return { data: finalData, error: null };
  } catch (err) {
    console.error("Errore in getSuspended:", err);
    return { data: null, error: err };
  }
};

module.exports = {
  getAll,
  getSuspended,
  getEvent,
  newEvent,
  deleteEvent,
  modifyResponse,
};
