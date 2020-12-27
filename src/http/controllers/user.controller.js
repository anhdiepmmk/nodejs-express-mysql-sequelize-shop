const User = require('../../models/user.model')
const ValidationError = require('../errors/validation.error')
const UnauthorizedError = require('../errors/unauthorized.error')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const NotfoundError = require('../errors/notfound.error')


exports.updateUser = async (req, res, next) => {
    const status = req.body.status
    const userId = req.userId

    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new NotfoundError()
        }

        user.status = status
        user.save()

        res.status(200).json({
            status: status
        })
    } catch (error) {
        next(error)
    }
}

exports.getUser = async (req, res, next) => {
    const userId = req.userId

    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new NotfoundError()
        }

        const userData = user.toJSON()
        delete userData.password

        res.status(200).json(userData)
    } catch (error) {
        next(error)
    }
}