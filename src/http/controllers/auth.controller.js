const User = require('../../models/user.model')
const ValidationError = require('../errors/validation.error')
const UnauthorizedError = require('../errors/unauthorized.error')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const validationError = new ValidationError('Validation failed.')
        validationError.data = errors.array()
        return next(validationError)
    }

    try {

        const email = req.body.email
        const name = req.body.name
        const password = req.body.password

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = new User({
            email: email,
            name: name,
            password: hashedPassword
        })

        const result = await user.save()

        res.status(201).json({
            message: 'User created.',
            user: result,
        })
    } catch (error) {
        next(error)
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const user = await User.findOne({ email: email })

        if (!user) {
            throw new UnauthorizedError('A user with this email could not be found.');
        }

        const isEqual = bcrypt.compare(password, user.password)

        if (!isEqual) {
            throw new UnauthorizedError('The password does not match.');
        }

        const token = jwt.sign({ email: user.email, userId: user._id }, 'a-secret-string', { expiresIn: '1h' });

        res.status(200).json({
            token: token,
            userId: user._id
        })
    } catch (error) {
        next(error)
    }
}