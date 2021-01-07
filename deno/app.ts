import { Application } from "https://deno.land/x/oak@v6.4.1/mod.ts";

import todosRoutes from './routes/todos.ts'

const app = new Application();

app.use(async (ctx, next) => {
  console.log('Middleware!');
  await next();
});

app.use(todosRoutes.routes())
app.use(todosRoutes.allowedMethods())

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on: ${port}`);
});

await app.listen({ port: 3000 });