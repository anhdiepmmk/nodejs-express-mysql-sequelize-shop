import { MongoClient, Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";

const client = new MongoClient();
await client.connect('mongodb://localhost/test');
const db = client.database("todo-app");

// console.log('xxxxxxxxxxxxxxxxxxxxxxxxbbbbbbbbbbbbbbbbbbbbbb');
// // Defining schema interface
// interface UserSchema {
//   _id: { $oid: string };
//   username: string;
//   password: string;
// }

// const users = db.collection<UserSchema>("users");

// // insert
// const insertId = await users.insertOne({
//   username: "user1",
//   password: "pass1",
// });

// // insertMany
// const insertIds = await users.insertMany([
//   {
//     username: "user1",
//     password: "pass1",
//   },
//   {
//     username: "user2",
//     password: "pass2",
//   },
// ]);

// // findOne
// const user1 = await users.findOne({ _id: insertId });

// console.log(user1);



export default db;