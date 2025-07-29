const supabase = require('../config/db');
const signUp = async (req) => {
	const { email, password } = req.body;

	const { user, error } = await supabase.auth.signUp({
		email: email,
		password: password,
	});
	if (error) {
		console.error('Error during registration:', error.message);
	} else {
		console.log('User  registered successfully:', user);
	}
};
module.exports = { signUp };
