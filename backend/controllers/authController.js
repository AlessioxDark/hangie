const Auth = require('../models/authModel');

const Signup = async (req, res) => {
	const { user, data, error } = await Auth.signUp(req);
	console.log({ user: user, data: data, error: error });
};
const Login = async (req, res) => {
	try {
		const { data, error } = await Auth.LoginPassword(req);
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(401).json({ error: 'Credenziali non valide' });
	}
};
module.exports = { Signup, Login };
