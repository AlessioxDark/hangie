// const Auth = require('../models/AuthModel');
const supabase = require('../config/db');
const bcrypt = require('bcrypt');
const Signup = async (req, res) => {
	console.log(req.body);
	const { email, password } = req.body;

	const { user, error } = await supabase.auth.signUp({
		email: email,
		password: password,
	});
	if (error) {
		console.error('Error during registration:', error.message);
	} else {
		const cryptedPassword = bcr;
		const { data, error } = await supabase.from('utenti').insert([
			{
				nome: userData.nome,
				email: email,
				password: userData.password,
			},
		]);
		console.log('User  registered successfully:', user);
	}
};
const Login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
		console.log(data);
	} catch (err) {
		res.status(401).json({ error: 'Credenziali non valide' });
	}
};
module.exports = { Signup, Login };
