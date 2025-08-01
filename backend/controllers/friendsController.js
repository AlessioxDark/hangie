const Friends = require('../models/friendsModel');
const getAllFriends = async (req, res) => {
	try {
		const { data, error } = await Friends.getAll(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}

		console.log(data);
		res.json(data); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getPendingFriends = async (req, res) => {
	try {
		const { data, error } = await Friends.getPending(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}

		console.log(data);
		res.json(data); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const sendFriendRequest = async (req, res) => {
	try {
		const { data, error } = await Friends.sendRequest(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}

		console.log(data);
		res.json(data); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const acceptFriendRequest = async (req, res) => {
	try {
		const { data, error } = await Friends.acceptRequest(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}

		console.log(data);
		res.json(data); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const denyFriendRequest = async (req, res) => {
	try {
		const { data, error } = await Friends.denyRequest(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}

		console.log(data);
		res.json(data); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
module.exports = {
	getAllFriends,
	getPendingFriends,
	sendFriendRequest,
	acceptFriendRequest,
	denyFriendRequest,
};
