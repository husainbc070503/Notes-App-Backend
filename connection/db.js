require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.MONGODB_URL

const connecToDb = async (req, res) => {
    mongoose.set('strictQuery', false)
    try {
        const conn = await mongoose.connect(url);
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(); // it  instruct node js to syncronously terminate the process
    }
};

module.exports = connecToDb;