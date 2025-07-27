const supabase = require('../config/db');
const getAll = async () => {
	const { data, error } = await supabase.from('eventi').select('*'); // Recupera tutti gli eventi dal database
	return { data, error };

	// Altri metodi per creare, aggiornare, eliminare eventi...
};
module.exports = { getAll };
