const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const User = require('../../models/user.model')
const isAuth = require('../middleware/is-auth')

const userController = require('../controllers/user.controller')

// PUT /user
router.patch('/', isAuth, userController.updateUser)

// GET /user
router.get('/', isAuth, userController.getUser)

module.exports = router