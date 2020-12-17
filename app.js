const express = require('express')
const app = express();

const feedRoutes = require('./routes/feed.router')
app.use('/feed', feedRoutes)

app.listen(8080, () => {
    console.log('Express running at 8080 port!');
})