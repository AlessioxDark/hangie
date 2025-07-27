require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/api/events', eventRoutes);
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
