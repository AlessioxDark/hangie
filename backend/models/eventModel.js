const supabase = require("../config/db");

const getAll = async (req) => {
  try {
    const EVENTSINPAGE = 12;
    const { offset } = req.body;
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
    const groupIds = eventsList.map((e) => e.eventi.gruppi.group_id);
    const { error: risposteError } = await supabase
      .from("risposte_eventi")
      .select(
        "user_id,is_creator,status, eventi!inner(event_id,gruppi(group_id))",
      )
      .eq("status", "accepted")
      .in("eventi.event_id", eventIds)
      .in("eventi.gruppi.group_id", groupIds);
    if (risposteError) throw risposteError;

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status,utente:utenti(*),eventi(*),created_at,is_creator")
        .in("eventi.event_id", eventIds);

    const eventParticipantsMap = eventParticipants.reduce((acc, curr) => {
      if (!acc[curr.eventi?.event_id]) acc[curr.eventi?.event_id] = [];
      acc[curr.eventi?.event_id].push({
        utenti: curr.utente,
        status: curr.status,
        is_creator: curr.is_creator,
        created_at: curr.created_at,
      });
      return acc;
    }, {});

    if (eventParticipantsError) throw eventParticipantsError;

    const finalData = eventsList.map((e) => {
      return {
        ...e,
        partecipanti: eventParticipantsMap[e?.event_id],
      };
    });
    console.log("adesso2", EVENTSINPAGE, finalData.length);
    return { data: finalData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

const deleteEvent = async (req) => {
  try {
    const { event_id } = req.params;

    const { error: messageError } = await supabase
      .from("messaggi")
      .delete()
      .eq("event_id", event_id);
    if (messageError) throw messageError;

    const { error: eventGroupError } = await supabase
      .from("eventi_gruppo")
      .delete()
      .eq("event_id", event_id);
    if (eventGroupError) throw eventGroupError;

    const { error: imgsError } = await supabase
      .from("event_imgs")
      .delete()
      .eq("event_id", event_id);
    if (imgsError) throw imgsError;

    const { err: eventError } = await supabase
      .from("eventi")
      .delete()
      .eq("event_id", event_id);
    if (eventError) throw eventError;

    const { data: files, error: listError } = await supabase.storage
      .from("eventi")
      .list(`${event_id}`);

    if (listError) throw listError;

    if (!files || files.length === 0) {
      return { data: { message: "ok" }, error: null };
    }
    const filesToRemove = files.map((x) => `${event_id}/${x.name}`);

    const { error: deleteError } = await supabase.storage
      .from("eventi")
      .remove(filesToRemove);

    if (deleteError) throw deleteError;

    return { data: { message: "ok" }, error: null };
  } catch (err) {
    return { error: err, data: null };
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
        status,eventi(event_id,
                      costo,
                      created_at,
                      created_by,
                      data,
                      titolo,
                      descrizione,
                      data_scadenza,
                      cover_img,
                      event_imgs(*),
                      utenti(user_id,nome,profile_pic),
                      luoghi(*),
                      gruppi(group_id,nome,group_cover_img,partecipanti_gruppo(partecipante_id)))`,
      )
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single();
    if (eventError) throw eventError;

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status, utente:utenti(*), created_at, is_creator") // Rimosso eventi(*) se non ti serve nel return
        .eq("event_id", event_id); // Filtro diretto sulla tabella principale

    if (eventParticipantsError) throw eventParticipantsError;

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

    // 🌟 FIX 1: Estraiamo "data" e lo ridenominiamo in "luogoId" per allinearlo al return di getOrCreateLuogo
    const { data: luogoId, error: luogoError } = await getOrCreateLuogo({
      nome_luogo,
      locationData,
    });
    if (luogoError) throw luogoError;

    console.log("luogoId ottenuto:", luogoId);

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
    console.log("errore ne", err);
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
    const { offset } = req.body;
    const user = req.user;
    const { data: eventsList, error: eventsListError } = await supabase
      .from("risposte_eventi")
      .select(
        "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome),luoghi(*),gruppi(group_id,nome,group_cover_img,group_id,partecipanti_gruppo(partecipante_id)))",
      )
      .eq("user_id", user.id)
      .eq("status", "pending")
      .range(offset, offset + EVENTSINPAGE - 1);
    if (eventsListError) throw eventsListError;

    if (eventsList.length == 0) return { data: [], error: null };
    const eventIds = eventsList.map((e) => e.event_id);
    const groupIds = eventsList.map((e) => e.eventi.gruppi.group_id);
    const { error: risposteError } = await supabase
      .from("risposte_eventi")
      .select(
        `
    user_id,
    is_creator,
    status,
    eventi!inner(
      event_id,
      gruppi!inner(
        group_id
      )
    )
  `,
      )
      .eq("status", "accepted")
      // Filtro sulla tabella "eventi" relazionata
      .filter("eventi.event_id", "in", `(${eventIds.join(",")})`)
      // Filtro sulla tabella "gruppi" annidata dentro eventi
      .filter("eventi.gruppi.group_id", "in", `(${groupIds.join(",")})`);

    if (risposteError) throw risposteError;

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select(
          `
      status,
      created_at,
      is_creator,
      utente:utenti(*),
      eventi!inner(*)
    `,
        )
        .filter("eventi.event_id", "in", `(${eventIds.join(",")})`);

    if (eventParticipantsError) throw eventParticipantsError;
    const eventParticipantsMap = eventParticipants.reduce((acc, curr) => {
      if (!acc[curr.eventi.event_id]) acc[curr.eventi.event_id] = [];
      acc[curr.eventi.event_id].push({
        utenti: curr.utente,
        status: curr.status,
        is_creator: curr.is_creator,
        created_at: curr.created_at,
      });
      return acc;
    }, {});
    if (eventParticipantsError) throw eventParticipantsError;
    console.log("ev part", eventParticipantsMap);
    const finalData = eventsList.map((e) => {
      return {
        ...e,
        partecipanti: eventParticipantsMap[e.event_id],
      };
    });

    return { data: finalData, error: null };
  } catch (err) {
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
