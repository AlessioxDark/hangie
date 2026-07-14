const supabase = require("../config/db");
const initialFriends = [
  "983d5e8e-a192-4887-a9b3-c827f2a25535",
  "4bf31b17-a97a-44ae-9893-82e6e5649c6a",
  "a9f85964-3588-4e88-924f-95358a8c3424",
  "c9befc11-9861-4732-b0c9-135498ba7090",
  "caae1e69-09da-4e5d-97ac-6b09947c0edd",
  "5edc5a0c-1aa5-440b-9f01-7909f066dd2f",
];
const initialGroups = [
  {
    nome: "Vette & Sentieri",
    descrizione:
      "Il punto di ritrovo per chi ama le escursioni in montagna e la fotografia naturalistica.",
    createdBy: "983d5e8e-a192-4887-a9b3-c827f2a25535", // ID di Marco Rossi
    group_cover_img:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  },
  {
    nome: "Zaino in Spalla",
    descrizione:
      "Consigli, itinerari low-cost e ricerca di compagni di viaggio per girare il mondo.",
    createdBy: "4bf31b17-a97a-44ae-9893-82e6e5649c6a", // ID di Sara Bianchi
    group_cover_img:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  },
  {
    nome: "Crossfit & Pizza",
    descrizione:
      "Ci alleniamo duramente per goderci la migliore pizza della città nel weekend.",
    createdBy: "a9f85964-3588-4e88-924f-95358a8c3424", // ID di Luca Moretti
    group_cover_img:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  },
  {
    nome: "Sketchbook Society",
    descrizione:
      "Incontri nei parchi per disegnare dal vivo e scambiarsi tecniche creative.",
    createdBy: "c9befc11-9861-4732-b0c9-135498ba7090", // ID di Elena Gialli
    group_cover_img:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  },
  {
    nome: "Chef a Domicilio",
    descrizione:
      "Appassionati di cucina fusion che organizzano cene a rotazione a casa dei membri.",
    createdBy: "caae1e69-09da-4e5d-97ac-6b09947c0edd", // ID di Davide Neri
    group_cover_img:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  },
];
const groupTemplates = {
  "Vette & Sentieri": [
    "Qualcuno ha controllato il meteo per domenica sul Gran Sasso?",
    "Ho appena comprato dei nuovi scarponi, devo provarli!",
    "La luce all'alba sulla cima era pazzesca, ecco la foto.",
    "Ragazzi, ricordatevi le torce frontali per la notturna!",
  ],
  "Zaino in Spalla": [
    "Ho trovato un volo per Tokyo a 400€, chi viene?",
    "Consigli per un ostello economico a Lisbona?",
    "Sto preparando lo zaino, sono a 7kg. Troppo?",
    "Qualcuno ha mai fatto il cammino di Santiago in solitaria?",
  ],
  "Crossfit & Pizza": [
    "Il WOD di oggi è stato devastante...",
    "Prenotato da 'Sorbillo' per sabato alle 21:00!",
    "Record personale di stacco da terra oggi! 🏋️‍♂️",
    "Quante pizze prendiamo? Io vado di doppia mozzarella.",
  ],
  "Sketchbook Society": [
    "Ci vediamo al parco alle 16:00 per disegnare?",
    "Ho provato i nuovi acquerelli, la grana è fantastica.",
    "Qualcuno sa come rendere meglio le ombre sul viso?",
    "Domenica c'è la mostra di Banksy, ci andiamo insieme?",
  ],
  "Chef a Domicilio": [
    "Stasera provo a fare il Ramen in casa, incrociate le dita.",
    "Chi porta il vino per la cena di venerdì?",
    "Ho scoperto un fornitore di spezie pazzesco!",
    "La cucina fusion tra messicano e giapponese è il futuro.",
  ],
};

const initialEvents = [
  {
    titolo: "Escursione Alba sul Gran Sasso",
    descrizione:
      "Partenza notturna per godersi l'alba dalla vetta. Portare abbigliamento a strati e torcia frontale.",
    data: "2026-05-15T03:30:00Z",
    data_scadenza: "2026-05-10T23:59:59Z",
    costo: 15.0,
    luogo_id: "08509cb5-1b88-4adc-9643-4aa50d6efa83",
    created_by: "983d5e8e-a192-4887-a9b3-c827f2a25535", // Marco Rossi
    cover_img:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
  },
  {
    titolo: "Meeting Pianificazione Viaggio Giappone",
    descrizione:
      "Ci incontriamo per definire l'itinerario finale e prenotare i Japan Rail Pass.",
    data: "2026-06-01T18:00:00Z",
    data_scadenza: "2026-05-25T23:59:59Z",
    costo: 0.0,
    luogo_id: "a12caf83-3238-4161-9573-8c921115b305",
    created_by: "4bf31b17-a97a-44ae-9893-82e6e5649c6a", // Sara Bianchi
    cover_img:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  },
  {
    titolo: "Cena Post-WOD: Pizza e Carboidrati",
    descrizione:
      "Dopo l'allenamento intenso di sabato, reintegriamo con la migliore pizza di Napoli.",
    data: "2026-04-20T20:30:00Z",
    data_scadenza: "2026-04-18T12:00:00Z",
    costo: 25.0,
    luogo_id: "59553005-66bf-497e-919f-7919110121af",
    created_by: "a9f85964-3588-4e88-924f-95358a8c3424", // Luca Moretti
    cover_img:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  },
];

const getData = async (req) => {
  try {
    const { userHandle } = req.params;

    // 1. Recupero ID Utente
    const { data: userData, error: userError } = await supabase
      .from("utenti")
      .select("user_id")
      .eq("handle", userHandle)
      .single();

    if (userError || !userData) throw userError;
    const user_id = userData.user_id;

    // 2. Recupero Profilo e Conteggi Base (Friends/Created)
    // Usiamo Promise.all per velocizzare
    const [profileRes, friendsRes, createdRes, acceptedRes] = await Promise.all(
      [
        supabase.from("utenti").select("*").eq("user_id", user_id).single(),
        supabase
          .from("amicizie")
          .select("*", { count: "exact", head: true })
          .or(`user_id.eq.${user_id},amico_id.eq.${user_id}`)
          .eq("status", "accepted"),
        supabase
          .from("eventi")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user_id),
        supabase
          .from("risposte_eventi")
          .select("eventi(data)")
          .eq("user_id", user_id)
          .eq("status", "accepted"),
      ],
    );

    if (profileRes.error) throw profileRes.error;

    // Variabili di appoggio con valori di default
    let newEventsData = [];
    let nuovoKarma = profileRes.data.karma || 100; // Default al karma attuale o 100
    const profileData = profileRes.data;
    const friendsCount = friendsRes.count || 0;
    const createdEventsCount = createdRes.count || 0;
    const acceptedEvents = acceptedRes.data || [];

    // 3. Recupero Eventi a cui partecipa
    const { data: eventsData, error: eventsError } = await supabase
      .from("risposte_eventi")
      .select(
        `
        event_id, 
        status, 
        eventi(
          event_id, costo, created_at, created_by, data, titolo, descrizione, 
          data_scadenza, cover_img, event_imgs(*), utenti(user_id, nome), 
          luoghi(*), gruppi(group_id, nome, group_cover_img, partecipanti_gruppo(partecipante_id))
        )
      `,
      )
      .eq("user_id", user_id);

    if (eventsError) throw eventsError;

    // 4. Se ci sono eventi, elaboriamo i dettagli e il Karma
    if (eventsData && eventsData.length > 0) {
      const eventIds = eventsData
        .map((e) => e?.eventi?.event_id)
        .filter((id) => id);

      if (eventIds.length > 0) {
        const { data: eventParticipants, error: eventParticipantsError } =
          await supabase
            .from("risposte_eventi")
            .select(
              "status, utente:utenti(*), eventi(*), created_at, is_creator",
            )
            .in("event_id", eventIds);
        if (eventParticipantsError) throw eventParticipantsError;
        const eventParticipantsMap = (eventParticipants || []).reduce(
          (acc, curr) => {
            const id = curr?.eventi?.event_id;
            if (id) {
              if (!acc[id]) acc[id] = [];
              acc[id].push({
                utenti: curr?.utente,
                status: curr?.status,
                is_creator: curr?.is_creator,
                created_at: curr?.created_at,
              });
            }
            return acc;
          },
          {},
        );

        newEventsData = eventsData.map((e) => ({
          event_id: e?.event_id,
          status: e?.status,
          costo: e?.eventi?.costo,
          data: e?.eventi?.data,
          titolo: e?.eventi?.titolo,
          group_id: e?.eventi?.group_id,
          descrizione: e?.eventi?.descrizione,
          created_by: e?.eventi?.created_by,
          cover_img: e?.eventi?.cover_img,
          event_imgs: e?.eventi?.event_imgs,
          luogo: e?.eventi?.luoghi,
          utente: e?.eventi?.utenti,
          gruppo: e?.eventi?.gruppi,
          scadenza: e?.eventi?.data_scadenza,
          risposte_evento: eventParticipantsMap[e?.event_id] || [],
        }));

        // Calcolo Karma
        const now = new Date().toISOString();
        const acceptedPast = eventsData.filter(
          (e) => e?.eventi?.data < now && e.status === "accepted",
        ).length;
        const rejectedPast = eventsData.filter(
          (e) => e?.eventi?.data < now && e.status === "rejected",
        ).length;

        nuovoKarma =
          100 + acceptedPast * 10 - rejectedPast * 20 + createdEventsCount * 20;

        // Aggiorna il Karma nel DB
        await supabase
          .from("utenti")
          .update({ karma: nuovoKarma })
          .eq("user_id", user_id);
      }
    }

    // 5. Return Finale (Tutte le variabili sono definite grazie ai default sopra)
    return {
      data: {
        ...profileData,
        karma: nuovoKarma,
        acceptedEventsCount: acceptedEvents.length,
        pastAttendedCount: acceptedEvents.filter(
          (e) => e.eventi?.data && new Date(e.eventi.data) < new Date(),
        ).length,
        createdEventsCount,
        friendsCount,
        newEventsData,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

const deleteGuest = async (req) => {
  try {
    const user = req.user;

    // 1. Identifichiamo le partecipazioni del guest e dei finti amici per capire in che gruppi sono
    const { data: participantsData, error: participantsError } = await supabase
      .from("partecipanti_gruppo")
      .select("*, gruppi(*)")
      .in("partecipante_id", [...initialFriends, user.id]);

    if (participantsError) throw participantsError;

    // 2. Separiamo accuratamente i gruppi dummy da quelli reali
    const dummyGroupIds = [
      ...new Set(
        participantsData
          .filter(
            (p) => p.gruppi && initialFriends.includes(p.gruppi.createdBy),
          ) // <--- "createdBy"
          .map((p) => p.group_id),
      ),
    ];

    const realGroupsParticipations = participantsData.filter(
      (p) => p.gruppi && !initialFriends.includes(p.gruppi.createdBy), // <--- "createdBy"
    );

    // 3. Eliminiamo i gruppi dummy (tabula rasa a cascata)
    if (dummyGroupIds.length > 0) {
      const { error: groupsError } = await supabase
        .from("gruppi")
        .delete()
        .in("group_id", dummyGroupIds);

      if (groupsError) throw groupsError;
    }

    // 4. Gestiamo i gruppi reali
    if (realGroupsParticipations.length > 0) {
      // Estraiamo solo gli ID unici dei gruppi reali
      const realGroupIds = [
        ...new Set(realGroupsParticipations.map((p) => p.group_id)),
      ];

      for (const groupId of realGroupIds) {
        // Troviamo la partecipazione specifica di questo gruppo per verificare chi è il creatore
        const groupParticipation = realGroupsParticipations.find(
          (p) => p.group_id === groupId,
        );
        const groupCreator = groupParticipation?.gruppi?.created_by; // o .createdBy in base al DB

        // 🛡️ APPLICHIAMO IL CASO A E B SOLO SE IL CREATORE ERA IL GUEST STESSO!
        if (groupCreator === user.id) {
          // Controlliamo chi è rimasto nel gruppo escludendo il guest e i finti amici
          const { data: remainingParticipants, error: remainingError } =
            await supabase
              .from("partecipanti_gruppo")
              .select("partecipante_id, joinedAt") // o joined_at
              .eq("group_id", groupId)
              .not(
                "partecipante_id",
                "in",
                `(${[...initialFriends, user.id].join(",")})`,
              )
              .order("joinedAt", { ascending: true }); // Dal più vecchio al più recente

          if (remainingError) throw remainingError;

          if (!remainingParticipants || remainingParticipants.length === 0) {
            // Caso A: Non c'è più nessun utente reale -> eliminiamo il gruppo reale vuoto
            const { error: deleteGroupError } = await supabase
              .from("gruppi")
              .delete()
              .eq("group_id", groupId);

            if (deleteGroupError) throw deleteGroupError;
            console.log(
              `Gruppo reale ${groupId} eliminato perché rimasto vuoto.`,
            );
          } else {
            // Caso B: Ci sono altri partecipanti reali -> promuoviamo il più vecchio
            const oldestParticipant = remainingParticipants[0];

            // Aggiorniamo il creatore del gruppo
            const { error: updateGroupError } = await supabase
              .from("gruppi")
              .update({ createdBy: oldestParticipant.partecipante_id })
              .eq("group_id", groupId);

            if (updateGroupError) throw updateGroupError;

            // Aggiorniamo il suo ruolo a "creator" o "admin"
            const { error: updateRoleError } = await supabase
              .from("partecipanti_gruppo")
              .update({ ruolo: "creator" }) // o la tua colonna ruolo/role
              .eq("group_id", groupId)
              .eq("partecipante_id", oldestParticipant.partecipante_id);

            if (updateRoleError) throw updateRoleError;

            console.log(
              `Gruppo reale ${groupId}: Nuovo creatore -> ${oldestParticipant.partecipante_id}`,
            );
          }
        } else {
          // Se il creatore del gruppo reale è un utente attivo esterno (es. Marco Rossi), non facciamo nulla!
          // Il CASCADE sul database toglierà il guest dai partecipanti in automatico alla fine.
          console.log(
            `Gruppo reale ${groupId} ignorato: il creatore è un altro utente attivo.`,
          );
        }
      }
    }

    // 5. Eliminiamo gli eventi rimasti del guest (quelli nei gruppi reali)
    const { error: guestEventsDeleteError } = await supabase
      .from("eventi")
      .delete()
      .eq("created_by", user.id);

    if (guestEventsDeleteError) throw guestEventsDeleteError;

    // 6. Eliminiamo i finti amici (initialFriends)
    if (initialFriends && initialFriends.length > 0) {
      const { error: friendsDeleteError } = await supabase
        .from("utenti")
        .delete()
        .in("user_id", initialFriends);

      if (friendsDeleteError) throw friendsDeleteError;
    }

    // 7. Infine, eliminiamo il Guest.
    const { error: userDeleteError } = await supabase
      .from("utenti")
      .delete()
      .eq("user_id", user.id);

    if (userDeleteError) throw userDeleteError;

    console.log("PULIZIA COMPLETATA CON SUCCESSO!");
    return { data: { success: true }, error: null };
  } catch (err) {
    console.log("EEEEEE", err);
    return { data: null, error: err.message };
  }
};
const addGuest = async (req) => {
  try {
    const { guestData } = req.body;

    const { error: userAddError } = await supabase
      .from("utenti")
      .insert(guestData);
    if (userAddError) throw userAddError;

    const newData = initialFriends.map((f) => {
      return {
        user_id: guestData.user_id,
        sender_id: guestData.user_id,
        amico_id: f,
        status: "accepted",
      };
    });
    const { error: friendsError } = await supabase
      .from("amicizie")
      .insert(newData);
    if (friendsError) throw friendsError;

    const { data: groupData, error: groupsError } = await supabase
      .from("gruppi")
      .insert(
        initialGroups.map((g) => {
          return g.nome == "Zaino in Spalla"
            ? { ...g, createdBy: guestData.user_id }
            : g;
        }),
      )
      .select("group_id,createdBy,nome");
    if (groupsError) console.log(groupsError);
    const gIds = groupData.map((g) => g.group_id);
    console.log("groupdata", groupData);
    const newParticipantsData = groupData.flatMap((g) => {
      const participants = [...initialFriends, guestData.user_id].map((f) => ({
        group_id: g.group_id,
        partecipante_id: f,
        role: g.createdBy === f ? "admin" : "member",
      }));

      return participants;
    });
    const { error: participantsError } = await supabase
      .from("partecipanti_gruppo")
      .insert(newParticipantsData);
    if (participantsError) throw participantsError;

    const eventsWithGroup = initialEvents.map((event, index) => ({
      ...event,
      group_id: gIds[index], // Colleghiamo l'evento al gruppo corrispondente
    }));
    const { data: eventData, error: eventsError } = await supabase
      .from("eventi")
      .insert(eventsWithGroup)
      .select("event_id, created_by, group_id");

    if (eventsError) throw eventsError;
    const { error: groupEventsError } = await supabase
      .from("eventi_gruppo")
      .insert(
        eventData.map((e) => {
          return { event_id: e.event_id, group_id: e.group_id };
        }),
      );

    if (groupEventsError) throw groupEventsError;

    const risposte_eventi = eventData.flatMap((e) => {
      return [...initialFriends, guestData.user_id].map((uId) => ({
        status:
          uId === e.created_by
            ? "accepted"
            : uId === guestData.user_id
              ? "accepted"
              : "pending",
        user_id: uId,
        event_id: e.event_id,
      }));
    });
    const { error: eventAnswersError } = await supabase
      .from("risposte_eventi")
      .insert(risposte_eventi);
    if (eventAnswersError) throw eventAnswersError;
    // 7. Inserisci Messaggi (inclusi gli Eventi nel feed)

    const theMessages = groupData.flatMap((group, index) => {
      const hasEvent = index < 3;
      const relatedEvent = hasEvent
        ? eventData.find((e) => e.group_id === group.group_id)
        : null;
      console.log(
        "rel eve",
        groupTemplates[`${group.nome}`],
        group.nome,
        groupTemplates,
      );

      return Array.from({ length: 5 }).map((_, i) => {
        const isEvent = hasEvent && i === 0;
        const sender_id =
          i === 0 ? group.createdBy : initialFriends[i % initialFriends.length];

        return {
          group_id: group.group_id,
          user_id: sender_id,
          type: isEvent ? "event" : "message",
          content: isEvent ? null : groupTemplates[group.nome][i],
          event_id: isEvent ? relatedEvent?.event_id : null,
        };
      });
    });
    const { error: messagesError } = await supabase
      .from("messaggi")
      .insert(theMessages);
    if (messagesError) throw messagesError;
    return { data: { success: true }, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};
module.exports = {
  getData,
  deleteGuest,
  addGuest,
};
