const supabase = require('../config/db');
const getAll = async (req) => {
	const { user_id } = req.body;
	const { data, error } = await supabase
		.from('amicizie')
		.select(
			`
    *,
    user_1:utenti!amicizie_user_id_fkey(*),
    user_2:utenti!amicizie_amico_id_fkey(*)
  `
		)
		.eq('user_1', user_id)
		.or('user_2', user_id)
		.eq('status', 'accepted');
	return { data, error };
};
const getPending = async (req) => {
	const { user_id } = req.params;
	const { data, error } = await supabase
		.from('amicizie')
		.select(
			`
    *,
    user_1:utenti!amicizie_user_id_fkey(*),
    user_2:utenti!amicizie_amico_id_fkey(*)
  `
		)
		.eq('user_1', user_id)
		.or('user_2', user_id)
		.eq('status', 'pending');
	return { data, error };
};
const sendRequest = async (req) => {
	const { friend_id } = req.body;
	const { user_id } = req.params;
	const { data, error } = await supabase
		.from('amicizie')
		.insert([{ user_id: user_id, amico_id: friend_id }]);
	return { data, error };
};
const acceptRequest = async (req) => {
	const { friend_id } = req.body;
	const { user_id } = req.params;
	const { data, error } = await supabase
		.from('amicizie')
		.update([{ status: 'accepted' }])
		.or(`user_id.eq.${user_id},user_id.eq.${friend_id}`)
		.or(`amico_id.eq.${user_id},amico_id.eq.${friend_id}`);
	return { data, error };
};
const denyRequest = async (req) => {
	const { friend_id } = req.body;
	const { user_id } = req.params;
	const { data, error } = await supabase
		.from('amicizie')
		.delete()
		.or(`user_id.eq.${user_id},user_id.eq.${friend_id}`)
		.or(`amico_id.eq.${user_id},amico_id.eq.${friend_id}`);
	return { data, error };
};
module.exports = {
	getAll,
	getPending,
	sendRequest,
	acceptRequest,
	denyRequest,
};
