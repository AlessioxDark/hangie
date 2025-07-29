const supabase = require('../config/db');
const getAll = async () => {
	const { data, error } = await supabase
		.from('eventi')
		.select('event_id,luogo,costo,data,titolo,created_by,event_cover_img'); // Recupera tutti gli eventi dal database

	return { data, error };
};
const getEvents = async () => {
	// const { user_id } = req.params;
	const { data, error } = await supabase
		.from('risposte_eventi')
		.select(
			'eventi(event_id,luogo,costo,data,titolo,created_by,event_cover_img)'
		)
		// .eq('risposte_eventi.user_id', user_id)
		.eq('status', 'accepted');

	return { data, error };
};
const getEvent = async (req) => {
	const { event_id } = req.params;
	// const { data, error } = await supabase
	// 	.from('eventi')
	// 	.select('*,utenti(nome,handle)')
	// 	.eq('event_id', event_id);
	const { data, error } = await supabase
		.from('eventi')
		.select(
			`
        titolo,
        event_cover_img,
        data,
        luogo, 
        costo,
        utenti(creatore:nome ),
        partecipanti:risposte_eventi!inner(user_id, status)(
            user_id,
            status
        ),
        rifiutatori:risposte_eventi!inner(user_id, status)(
            user_id,
            status
        )
    `
		)
		.eq('event_id', event_id);
	return { data, error };
};
module.exports = { getAll, getEvent, getEvents };
