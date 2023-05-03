const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const getAllNotes = asyncHandler( async (req, res) => {
    const notes = await Note.find().lean()
    if (!notes) {
        return res.status(404).json({ message: 'NO Notes Found' })
    }
    res.json(notes)
})

const createNewNote = asyncHandler( async (req, res) => {
    const { title,  user, text } = req.body

    if (!title || !user || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const noteObject = {
        title,
        text,
        user
    }
    const note = await Note.create(noteObject)
    if (note) {
        res.status(201).json({ message: 'Note created' })
    }  else {
       res.status(400).json({ message: 'Invalid note data' })   
    }
})

const updateNote = asyncHandler( async (req, res) => {
    const { title, text, user, completed } = req.body
    if (!title || !text || !user || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const note = await Note.findOne({ user }).exec()
    if (!note) {
        return res.status(404).json({ message: 'Note not found' })
    }
    note.title = title
    note.text = text
    note.completed = completed
    const updatedNote = await note.save()
    res.json({ message: 'Note updated' })
})

const deleteNote = asyncHandler( async (req, res) => {
    const { user } = req.body
    if (!user) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const note = await Note.findOne({ user }).exec()
    if (!note) {
        return res.status(404).json({ message: 'Note not found' })
    }
    await note.remove()
    res.json({ message: 'Note deleted' })
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}