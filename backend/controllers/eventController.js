const Event = require('../models/eventModel');

const getAllEvents = async (req, res) => {
	try {
		const { data, error } = await Event.getAll(); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = { getAllEvents };
