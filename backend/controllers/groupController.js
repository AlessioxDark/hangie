const Group = require('../models/groupModel');

const getAllGroups = async (req, res) => {
	try {
		const { data, error } = await Group.getAll(); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}
		const formattedData = data.map((row) => {
			let ultimoMessaggio = null;
			row.messaggi.forEach((messaggio) => {
				if (!ultimoMessaggio || messaggio.sent_at > ultimoMessaggio.sent_at) {
					ultimoMessaggio = messaggio;
				}
			});
			let ultimoEvento = null;
			row.eventi.forEach((evento) => {
				if (!ultimoEvento || evento.data > ultimoEvento.data) {
					ultimoMessaggio = evento;
				}
			});
			const { eventi, messaggi, ...groupData } = row;
			return {
				...groupData,
				ultimoMessaggio: ultimoMessaggio.content,
				evento: ultimoEvento,
			};
		});

		console.log(formattedData);
		res.json(formattedData); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getSpecificGroup = async (req, res) => {
	try {
		const { data, error } = await Group.getGroup(req);
		if (error) {
			console.log(error);
		}
		console.log(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getGroupEvents = async (req, res) => {
	try {
		const { data, error } = await Group.getEvents(req);
		if (error) {
			console.log(error);
		}
		console.log(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = { getAllGroups, getSpecificGroup, getGroupEvents };
