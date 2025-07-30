const supabase = require('../config/db');
const signUp = async (req) => {
	const { email, nome, handle, password } = req.body;

	const { user, errore } = await supabase.auth.signUp({
		email: email,
		password: password,
	});
	if (errore) {
		console.error('Error during registration:', error.message);
	} else {
		const { data, error } = await supabase.from('utenti').insert([
			{
				nome: nome,
				email: email,
				handle,
				password: password,
			},
		]);
		return { user, data, error };
	}
};
const LoginPassword = async (req) => {
	const { email, nome, handle, password } = req.body;

	const { user, error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password,
	});
	if (error) {
		console.error('Error during registration:', error.message);
	} else {
		return { user, error };
	}
};
module.exports = { signUp, LoginPassword };
