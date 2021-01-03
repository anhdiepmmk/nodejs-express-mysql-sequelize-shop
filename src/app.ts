import express from 'express';
import bodyParser from 'body-parser';

import todosRoutes from './routes/todos';

const app = express();

app.use(bodyParser.json());

app.use(todosRoutes);

const PORT = 3000

app.listen(PORT, () => {
    console.log('This web is running at port ' + PORT);
});
