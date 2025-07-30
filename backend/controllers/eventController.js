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
		const { data, error } = await Event.getEvents(); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getSpecificEvent = async (req, res) => {
	try {
		const { data, error } = await Event.getEvent(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
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
		const { data, error } = await Event.newEvent(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const modifyResponseEvent = async (req, res) => {
	try {
		const { data, error } = await Event.modifyResponse(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = {
	getAllEvents,
	getMyEvents,
	getSpecificEvent,
	modifyEvent,
	addNewEvent,
	modifyResponseEvent,
};
