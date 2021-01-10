import { Application } from "https://deno.land/x/oak@v6.4.1/mod.ts";
// import { oakCors } from "https://deno.land/x/cors/mod.ts";
// import { connect } from "./helpers/db_client.ts";
// await connect();



import todosRoutes from './routes/todos.ts'

const app = new Application();

app.use(async (ctx, next) => {
  console.log('Middleware!');
  await next();
});


// app.use(
//     oakCors({
//       origin: "http://localhost:3000"
//     }),
// );

app.use(async (ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  ctx.response.headers.set('Access-Control-Allow-Headers','Content-Type');
  await next();
})

app.use(todosRoutes.routes())
app.use(todosRoutes.allowedMethods())

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on: ${port}`);
});

await app.listen({ port: 8000 });