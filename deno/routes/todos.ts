import { Router } from "https://deno.land/x/oak@v6.4.1/mod.ts";

const router = new Router();

interface Todo {
    id: string;
    text: string;
}

let todos: Todo[] = [];

router.get('/todos', (ctx) => {
    ctx.response.body = { todos: todos };
});

router.post('/todos', async (ctx) => {
    const body = ctx.request.body({type: 'json'});
    const value = await body.value

    const newTodo: Todo = {
        id: new Date().toISOString(),
        text: value.text,
    };

    todos.push(newTodo);

    ctx.response.body = { message: 'Created todo!', todo: newTodo };
});

router.put('/todos/:todoId', (ctx) => {

});

router.delete('/todos/:todoId', (ctx) => {

});

export default router;