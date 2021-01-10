import { MongoClient, Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";

const client = new MongoClient();
await client.connect('mongodb://localhost/test');
const db = client.database("todo-app");

export default db;