import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import { appRouter } from "./router.js"; 
import { createContext } from "./context.js";

const app = express();
app.use(cors());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`🔗 tRPC API ready at http://localhost:${port}/trpc`);
});