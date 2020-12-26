const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const User = require('../../models/user.model')

const authController = require('../controllers/auth.controller')

router.put('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(result => {
                    if (result) {
                        return Promise.reject('E-Mail address already exists!')
                    }
                })
            }).normalizeEmail()
        ,
        body('name').trim().isLength({ min: 5 }),
        body('password').trim().not().isEmpty()
    ],
    authController.signup)

router.post('/login', authController.login)

module.exports = router