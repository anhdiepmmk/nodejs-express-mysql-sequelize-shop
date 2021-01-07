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

router.put('/todos/:todoId', async (ctx) => {
    const body = ctx.request.body({type: 'json'});
    const value = await body.value;

    const id: string | undefined = ctx.params.todoId;

    const foundIndex = todos.findIndex(value => value.id === id);

    if (foundIndex > -1) {
        todos[foundIndex] = {
            id: id!, text: value.text
        };

        ctx.response.body = { message: 'Updated!' };
    } else {
        ctx.response.body = { message: 'Id not found!' };
    }
});

router.delete('/todos/:todoId', async (ctx) => {
    const id = ctx.params.todoId;

    todos = todos.filter(value => value.id !== id);

    ctx.response.body = { message: 'Deleted!' }
});

export default router;