import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import filesRouter from "./api/files/index.js";
import cors from "cors";
import { join } from "path";
import {
  genericErrorHandler,
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
} from "./errorsHandlers.js";

const server = Express();
const port = process.env.PORT;

console.log(process.env.PORT);

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);

server.use(Express.json());

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/uploadCover", filesRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}`);
});
