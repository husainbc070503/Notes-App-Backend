const FetchUser = require('../middlewares/FetchUser');
const Note = require('../models/Notes');

const router = require('express').Router();

router.post("/addNote", FetchUser, async (req, res) => {
    const { title, content, category } = req.body;
    let success = false;

    try {

        if (!title || !content || !category) {
            res.status(400).json({ success, error: "Please fill all the required fields." });
            return;
        }

        let note = await Note.create({ title, content, category, user: req.user });
        note = await Note.findById(note._id).populate('user', '-password');

        if (note) {
            success = true;
            res.status(200).json({ success, note });
            return;
        } else {
            res.status(400).json({ success, error: "Error" });
            return;
        }

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
});

router.put("/updateNote/:id", FetchUser, async (req, res) => {
    const { title, content, category } = req.body;
    let success = false;

    try {

        var note = await Note.findById(req.params.id);
        if (!note) {
            res.status(400).json({ success, error: "No note found." });
            return;
        }

        if (note.user.toString() != req.user._id.toString()) {
            res.status(400).json({ success, error: "Unautorized, Please login." });
            return;
        }

        note = await Note.findByIdAndUpdate(req.params.id, {
            title, content, category
        }, { new: true }).populate("user", "-password");

        success = true;
        res.status(200).json({ success, note })

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
})


router.delete("/deleteNote/:id", FetchUser, async (req, res) => {
    let success = false;

    try {

        var note = await Note.findById(req.params.id);
        if (!note) {
            res.status(400).json({ success, error: "No note found." });
            return;
        }

        if (note.user.toString() != req.user._id.toString()) {
            res.status(400).json({ success, error: "Unautorized, Please login." });
            return;
        }

        note = await Note.findByIdAndDelete(req.params.id);

        success = true;
        res.status(200).json({ success, note })

    } catch (error) {
        res.status(400).json({ success, error: error.message })
    }
})


router.get("/fetchNotes", FetchUser, async (req, res) => {
    const notes = await Note.find({ user: req.user._id }).populate('user', '-password');
    res.json(notes);
})


router.get("/fetchNote/:id", FetchUser, async (req, res) => {
    const note = await Note.find({ user: req.user._id, _id: req.params.id }).populate('user', '-password');
    note ? res.json(note) : res.status(400).json({ message: "No note found!" });
})


module.exports = router;
