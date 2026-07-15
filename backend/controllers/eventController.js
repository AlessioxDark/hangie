const Event = require("../models/eventModel");

const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await Event.getAll(req);
    if (error) throw error;
    const cleanData = data.map((response) => {
      return {
        event_id: response.event_id,
        status: response.status, // Stato (pending, accepted, refused)
        costo: response.eventi.costo,
        data: response.eventi.data,
        titolo: response.eventi.titolo,
        group_id: response.eventi.group_id,
        descrizione: response.eventi.descrizione,
        created_by: response.eventi.created_by,

        cover_img: response.eventi.cover_img,
        event_imgs: response.eventi.event_imgs,
        luogo: response.eventi.luoghi, // Attenzione, qui è 'luoghi' non 'luogo'
        utente: response.eventi.utenti,
        gruppo: response.eventi.gruppi, // Attenzione, qui è 'gruppi' non 'gruppo'
        scadenza: response.eventi.data_scadenza,
        risposte_evento: response.partecipanti,
        // Non includere ...dato (spread) qui se vuoi un oggetto pulito
      };
    });

    const newCleanData = {
      pending: cleanData.filter((response) => {
        return response.status == "pending";
      }),
      accepted: cleanData.filter((response) => {
        return response.status == "accepted";
      }),
    };

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: newCleanData, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo  a trovare i tuoi eventi", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const getMyEvents = async (req, res) => {
  try {
    const { data, error } = await Event.getAll(req);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const responseData = data || [];
    res.json({ success: true, data: responseData });
  } catch (err) {
    console.error("Errore inaspettato nel controller:", err.message);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
const getSpecificEvent = async (req, res) => {
  try {
    console.log("ARRR");
    const { data, error } = await Event.getEvent(req); // Rimosso 'res' dai parametri del service
    console.log("ritorno con", { data, error });
    if (error) {
      console.log("invio");
      // Se l'errore è dovuto alla mancanza di invito, restituiamo un 403 Forbidden
      if (error.message === "Non sei invitato a questo evento") {
        console.log("invio");
        console.log("invio");
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      throw error; // Altri errori imprevisti finiscono nel catch (500)
    }

    // Costruiamo il payload di risposta
    const newData = {
      event_id: data.event_id,
      status: data.status,
      costo: data.eventi?.costo,
      data: data.eventi?.data,
      titolo: data.eventi?.titolo,
      descrizione: data.eventi?.descrizione,
      cover_img: data.eventi?.cover_img,
      event_imgs: data.eventi?.event_imgs,
      luogo: data.eventi?.luoghi,
      utente: data.eventi?.utenti,
      gruppo: data.eventi?.gruppi,
      scadenza: data.eventi?.data_scadenza,
      created_by: data.eventi?.created_by,
      risposte_evento: data.partecipanti,
    };

    return res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: newData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Impossibile trovare l'evento richiesto", // Sistemato typo "Non siamo a trovare..."
      details: err.message,
    });
  }
};
const modifyEvent = async (req, res) => {
  try {
    const { data, error } = await Event.modify(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const addNewEvent = async (req, res) => {
  try {
    const { data, error } = await Event.newEvent(req);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a creare il tuo evento",
      details: err.message,
    });
  }
};
const modifyResponseEvent = async (req, res) => {
  try {
    const { data, error } = await Event.modifyResponse(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a votare il tuo evento",
      details: err.message,
    });
  }
};
const deleteSpecificEvent = async (req, res) => {
  try {
    const { data, error } = await Event.deleteEvent(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare il tuo evento", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const getSuspendedEvents = async (req, res) => {
  try {
    const { data, error } = await Event.getSuspended(req);
    if (error) throw error;
    const cleanData = data.map((response) => {
      return {
        event_id: response.event_id,
        status: response.status, // Stato (pending, accepted, refused)
        costo: response.eventi.costo,
        data: response.eventi.data,
        group_id: response.eventi.group_id,
        titolo: response.eventi.titolo,
        descrizione: response.eventi.descrizione,
        cover_img: response.eventi.cover_img,
        event_imgs: response.eventi.event_imgs,
        luogo: response.eventi.luoghi, // Attenzione, qui è 'luoghi' non 'luogo'
        utente: response.eventi.utenti,
        gruppo: response.eventi.gruppi, // Attenzione, qui è 'gruppi' non 'gruppo'
        scadenza: response.eventi.data_scadenza,
        risposte_evento: response.partecipanti,
        // Non includere ...dato (spread) qui se vuoi un oggetto pulito
      };
    });

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: cleanData, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi eventi", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
module.exports = {
  getAllEvents,
  getMyEvents,
  getSpecificEvent,
  modifyEvent,
  addNewEvent,
  modifyResponseEvent,
  getSuspendedEvents,
  deleteSpecificEvent,
};
