const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const path = require('path')

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

const feedRoutes = require('./http/routes/feed.router')
const authRoutes = require('./http/routes/auth.router')
app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    const httpStatusCode = error.httpStatusCode || 500
    const message = error.message
    const data = error.data

    res.status(httpStatusCode).json({
        message: message,
        data: data
    })
})

mongoose.connect('mongodb://course:course2123@localhost:27017/messages?authSource=admin', { useNewUrlParser: true })
    .then(e => console.log('Mongodb connected'))
    .catch(e => console.log('Mongodb connection failed'))

app.listen(8080, () => {
    console.log('Express running at 8080 port!');
})