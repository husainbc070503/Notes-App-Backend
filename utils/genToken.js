require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const genToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET);
}

module.exports = genToken;