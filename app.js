import express from 'express';
import resHandler from './respons-handler.js';

const app = express()

console.log(resHandler);

app.use('/', resHandler)

app.listen(3000, () => {
    console.log('This app is listening at 3000 port.');
})