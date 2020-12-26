const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(cors())
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

const feedRoutes = require('./http/routes/feed.router')
app.use('/feed', feedRoutes)

app.use((error, req, res, next) => {
    const httpStatusCode = error.httpStatusCode || 500
    const message = error.message

    console.log(error);

    res.status(httpStatusCode).json({
        message: message
    })
})

mongoose.connect('mongodb://course:course2123@localhost:27017/messages?authSource=admin', { useNewUrlParser: true })
    .then(e => console.log('Mongodb connected'))
    .catch(e => console.log('Mongodb connection failed'))

app.listen(8080, () => {
    console.log('Express running at 8080 port!');
})