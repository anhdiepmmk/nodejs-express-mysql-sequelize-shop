const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const feedRoutes = require('./http/routes/feed.router')
app.use('/feed', feedRoutes)

app.listen(8080, () => {
    console.log('Express running at 8080 port!');
})