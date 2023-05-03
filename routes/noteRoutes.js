const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteControllers');

router.route('/')
    .get(noteController.getAllNotes)
    .post(noteController.createNewNote)
    .put(noteController.updateNote)
    .delete(noteController.deleteNote)


module.exports = router;