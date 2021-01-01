import express from 'express';
import resHandler from './response-handler.js';

const app = express()

app.use('/', resHandler)

app.listen(3000, () => {
    console.log('This app is listening at 3000 port.');
})