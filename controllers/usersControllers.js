const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const getAllUsers = asyncHandler( async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users) {
        return res.status(404).json({ message: 'Users not found' })
    }
    res.json(users)
})

const createNewUser = asyncHandler( async (req, res) => {
    const { username, password, roles } = req.body

    if (!username || !password || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const userObject = {
        username,
        'password': hashedPassword,
        roles
    }
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({ message: 'User created' })
    }  else {
       res.status(400).json({ message: 'Invalid user data' })   
    }
})

const updateUser = asyncHandler( async (req, res) => {
    const { id, username, password, roles,active } = req.body
    if (!id || !username || !password || !Array.isArray(roles) || roles.length === 0|| typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'User already exists' })
    }
    user.username = username
    user.roles = roles
    user.active = active
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
    }
    const updatedUser = await user.save()
    res.json({ message: 'User updated' })
})

const deleteUser = asyncHandler( async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' })
    }
    const notes = await Note.findOne({ user: id }).lean().exec()
    if (notes?.length) {
        return res.status(409).json({ message: 'User has notes' })        
    }
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }
    const result = await user.deleteOne()
    const reply = `User ${result.username} deleted`
    res.json(reply)
})

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }