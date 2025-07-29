const supabase = require('../config/db');
const getAll = async () => {
	const { data, error } = await supabase
		.from('eventi')
		.select('event_id,luogo,costo,data,titolo,created_by'); // Recupera tutti gli eventi dal database

	return { data, error };
};
const getEvents = async (req) => {
	const { user_id } = req.params;
	const { data, error } = await supabase
		.from('eventi')
		.select('event_id,luogo,costo,data,titolo,created_by,risposte_eventi(*)')
		.eq('risposte_eventi.user_id', user_id)
		.eq('risposte_eventi.status', 'accepted');

	return { data, error };
};
module.exports = { getAll, getEvents };
