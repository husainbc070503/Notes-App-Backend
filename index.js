require('dotenv').config();
const express = require('express');
const connecToDb = require('./connection/db');
const app = express();
const cors = require('cors');
const port = process.env.PORT

connecToDb();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("Hello World Husain"));

/* API */
app.use('/api/user', require('./routes/Auth'))
app.use('/api/note', require('./routes/Notes'))

app.listen(port, () => console.log(`Server running on port ${port}`));