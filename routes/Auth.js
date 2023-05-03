require('dotenv').config();
const FetchUser = require('../middlewares/FetchUser');
const Token = require('../models/Token');
const User = require('../models/User');
const genToken = require('../utils/genToken');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const mailer = (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const options = {
        from: process.env.USER,
        to: email,
        subject: "Password Change OTP",
        text: `Your OTP for changing password is: ${otp.otp}`
    };

    transporter.sendMail(options)
        .then((succ) => console.log(`Mail Send Successfully ${succ.accepted}`))
        .catch((err) => console.log(err));
}

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    let success = false;

    try {

        if (!name || !email || !password) {
            res.status(400).json({ success, error: 'Please fill the required fields.' });
            return;
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ success, error: 'User already exists with the credentials.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: secPass });
        if (user) {
            success = true;
            res.status(200).json({
                success, user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: genToken(user._id)
                }
            })
        } else {
            res.status(400).json({ success, error: 'Failed to register. Please try again after sometime!' });
            return;
        }

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let success = false;

    try {

        if (!email || !password) {
            res.status(400).json({ success, error: 'Please fill the required fields.' });
            return;
        }

        let user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success, error: 'No user with such credentials.' });
            return;
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            res.status(400).json({ success, error: 'Invalid Credentials' });
            return;
        }

        success = true;
        res.status(200).json({
            success, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: genToken(user._id)
            }
        })

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
});


router.put('/updateProfile', FetchUser, async (req, res) => {
    const { name, email } = req.body;
    let success = false;

    try {

        let user = await User.findOne({ _id: req.user._id });
        if (!user) {
            res.status(400).json({ success, error: 'No user with such credentials.' });
            return;
        }

        user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true });

        if (user) {

            success = true;
            res.status(200).json({
                success, user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: genToken(user._id)
                }
            })
        } else {
            res.status(400).json({ success, error: "Session expired" })
            return;
        }
    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
});

router.post('/sendLink', async (req, res) => {
    const { email } = req.body;

    try {

        let user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success, error: "User does not exists" });
            return;
        }

        const otp = await Token.create({
            email, otp: Math.floor(Math.random() * 10000),
            expiresIn: new Date().getTime() + 500 * 1000
        })

        success = true;
        mailer(email, otp);
        res.status(200).json({ success });

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
});

router.post('/updatePassword', async (req, res) => {
    const { otp, password, email } = req.body;
    let success = false;

    try {

        const t = await Token.findOne({ email, otp });

        if (t) {
            const currTime = new Date().getTime();
            const time = t.expiresIn;
            const diff = time - currTime;
            if (diff < 0) {
                res.status(400).json({ success, error: "Your otp expired!" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(password, salt);

            let user = await User.findOne({ email });
            user = await User.findByIdAndUpdate(user._id, { password: secPass }, { new: true })

            if (user) {
                success = true;
                res.status(200).json({
                    success, user
                });
            } else {
                res.status(400).json({ success, error: "Failed to update password" });
                return;
            }

        } else {
            res.status(400).json({ success, error: "Invalid OTP" });
            return;
        }

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
})

module.exports = router