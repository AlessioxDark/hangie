require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const groupRoutes = require('./routes/groupRoutes');
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes); // Assuming groupRoutes is defined similarly
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
