const supabase = require('../config/db');
const getAll = async () => {
	const { data, error } = await supabase.from('gruppi').select(
		`
    group_id,
      nome,
      group_cover_img,
       messaggi(
       content,
       sent_at
       ),
       eventi (
       titolo,
       event_id,
       data,
       event_cover_img)
       `
	);

	return { data, error };
};
const getGroup = async (req) => {
	const { group_id } = req.params;
	const { data, error } = await supabase.from('gruppi').select(
		`
    group_id,
    nome,
    group_cover_img,
    messaggi (
    content,
    sent_at,
    user_id,
    message_id,
    utenti(
    nome
    )
    ),
    partecipanti_gruppo (
    partecipante_id
    )
    `
	);
	// .eq('group_id', group_id);
	// const { data, error } = await supabase.from('gruppi').select(
	// 	`
	//   group_id,
	//     nome,
	//     group_cover_img,
	//      messaggi(
	//      content,
	//      sent_at
	//      ),
	//      eventi (
	//      titolo,
	//      event_id,
	//      data,
	//      event_cover_img)
	//      `
	// );

	return { data, error };
};
const getEvents = async (req) => {
	const { group_id } = req.params;

	const { data, error } = await supabase
		.from('eventi')
		.select('event_id,titolo,event_cover_img,costo')
		.eq('group_id', group_id);
	console.log(data);
	return { data, error };
};
module.exports = { getAll, getGroup, getEvents };
