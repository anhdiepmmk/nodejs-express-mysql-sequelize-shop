import { Application } from "https://deno.land/x/oak@v6.4.1/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello World!!!";
});

await app.listen({ port: 8000 });