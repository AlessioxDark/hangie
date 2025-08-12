require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes); // Assuming groupRoutes is defined similarly
app.get('/', (req, res) => {
	res.send('<h1>tutto funziona</h1>');
});
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
