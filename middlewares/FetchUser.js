require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

const FetchUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {

            token = req.headers.authorization.split(" ")[1];
            const data = jwt.verify(token, JWT_SECRET);

            req.user = await User.findById(data.id).select("-password");
            next();

        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    if (!token) {
        res.status(400).json({ error: "Not authorized!!" })
        return;
    }
}

module.exports = FetchUser