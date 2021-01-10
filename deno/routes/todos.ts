import { Router } from "https://deno.land/x/oak@v6.4.1/mod.ts";
import db from "./../helpers/db_client.ts";
import { Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";

const router = new Router();

interface TodoSchema {
  _id: Bson.ObjectId;
   text: string;
}


router.get('/todos', async (ctx) => {
    const todos: TodoSchema[] = await db.collection<TodoSchema>('todos').find().toArray();

    const transformedTodos = todos.map((todo: TodoSchema) => {
        return {
             id: todo._id.toString(), text: todo.text
        };
    });

    ctx.response.body = { todos: transformedTodos };
});

router.post('/todos', async (ctx) => {
    const body = ctx.request.body({type: 'json'});
    const value = await body.value

    const doc = {
        text: value.text,
    }

    const insertId = await db.collection<TodoSchema>('todos').insertOne(doc);

    ctx.response.body = { message: 'Created todo!', todo: { ...doc, _id: insertId } };
});

router.put('/todos/:todoId', async (ctx) => {
    const body = ctx.request.body({type: 'json'});
    const value = await body.value;

    const collectionTodos = db.collection<TodoSchema>('todos');

    const id: string | undefined = ctx.params.todoId;

    const found: TodoSchema | undefined = await collectionTodos.findOne({ _id: new Bson.ObjectId(id) });

    if (found) {
        const result = await collectionTodos.updateOne({
            _id: new Bson.ObjectId(id)
        }, {
            $set: { text: value.text }
        })
        ctx.response.body = { message: 'Updated!', data: result };
    } else {
        ctx.response.body = { message: 'Id not found!' };
    }
});

router.delete('/todos/:todoId', async (ctx) => {
    const id = ctx.params.todoId;

    const collectionTodos = db.collection<TodoSchema>('todos');

    const found: TodoSchema | undefined = await collectionTodos.findOne({ _id: new Bson.ObjectId(id) });

    if (found) {
        const result = await collectionTodos.deleteOne({
            _id: new Bson.ObjectId(id)
        })
        ctx.response.body = { message: 'Deleted!', result: result }
    } else {
        ctx.response.body = { message: 'Id not found!' };
    }

    
});

export default router;