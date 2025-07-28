const supabase = require('../config/db');
const getAll = async () => {
	const { data, error } = await supabase
		.from('eventi')
		.select('event_id,luogo,costo,data,titolo,created_by'); // Recupera tutti gli eventi dal database

	return { data, error };
};
module.exports = getAll;
