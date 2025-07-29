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
       eventi(
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
const getEvent = async (req) => {
	const { event_id } = req.params;

	const { data, error } = await supabase
		.from('eventi')
		.select('*')
		.eq('event_id', event_id);
	console.log(data);
	return { data, error };
};
module.exports = { getAll, getGroup, getEvent };
