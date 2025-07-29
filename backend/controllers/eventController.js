const Event = require('../models/eventModel');

const getAllEvents = async (req, res) => {
	try {
		const { data, error } = await Event.getAll(); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getMyEvents = async (req, res) => {
	try {
		const { data, error } = await Event.getEvents(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = { getAllEvents, getMyEvents };
